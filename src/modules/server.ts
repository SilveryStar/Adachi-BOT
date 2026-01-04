import { join } from "path";
import express from "express";
import useWebsocket, { Application } from "express-ws";
import * as process from "process";
import { Server } from "http";
import PluginManager from "@/modules/plugin";
import FileManagement from "@/modules/file";
import { BotConfig } from "@/modules/config";
import { Client } from "@/modules/lib";
import { getIPAddress } from "@/utils/network";
import AssetsUpdate from "@/modules/management/assets";
import axios from "axios";
import { isJsonString } from "@/utils/verify";
import { formatVersion } from "@/utils/format";

/**
 * 仅负责 renderPort（插件路由/静态 + 渲染用 html 资源）
 * WebConsole 相关的内容已迁移为独立端口服务，避免过强的耦合导致响应迟缓
 */
export default class RenderServer {
	private static _instance: RenderServer | null = null;
	
	private app: Application;
	private server: Server | null = null;
	
	// 承接插件路由
	private pluginRouterHandler: express.RequestHandler;
	
	// 插件路由容器（会整体替换）
	private currentPluginRouter = express.Router();
	
	private firstListener = true;
	
	constructor(
		private readonly config: BotConfig,
		private readonly file: FileManagement,
		private readonly client: Client
	) {
		const wsInstance = useWebsocket( express() );
		this.app = wsInstance.app;
		
		// 统一插件路由入口，仅挂载一次，在内部通过 currentPluginRouter 来实现热切换的效果
		this.pluginRouterHandler = ( req, res, next ) => this.currentPluginRouter( req, res, next );
		this.app.use( this.pluginRouterHandler );
		
		// main.yml 配置项改变后的相关自适应操作
		this.config.base.on( "refresh", async ( newCfg, oldCfg ) => {
			// renderPort 没发生变化或者压根没启动 server 服务，就别管了
			if ( newCfg.renderPort === oldCfg.renderPort || !this.server ) return;
			
			await this.closePromise();
			this.client.logger.info( `原公共服务端口 ${ oldCfg.renderPort } 已关闭` );
			
			if ( this.shouldListenRenderPort() ) {
				this.server = this.listenerPort();
			}
		} );
	}
	
	public static getInstance( config?: BotConfig, file?: FileManagement, client?: Client ): RenderServer {
		if ( !RenderServer._instance ) {
			if ( !config || !file || !client ) {
				throw new Error( "获取 server 实例出错" );
			}
			RenderServer._instance = new RenderServer( config, file, client );
		}
		return RenderServer._instance;
	}
	
	/**
	 * 是否需要监听 renderPort 来启动公共 server：
	 * - 任一插件配置项中声明了 servers（自定义 API 路由）
	 * - 或任一插件配置项中声明了 publicDirs（静态资源目录）
	 */
	private shouldListenRenderPort(): boolean {
		const pluginInstance = PluginManager.getInstance();
		const list = pluginInstance.pluginList;
		const keys = Object.keys( list );
		
		// 没插件就默认不占端口
		if ( !keys.length ) return false;
		
		return keys.some( k => {
			const info = list[k];
			if ( !info ) return false;
			
			const hasServers = Array.isArray( info.servers ) && info.servers.length > 0;
			const hasPublicDirs = Array.isArray( info.publicDirs ) && info.publicDirs.length > 0;
			return hasServers || hasPublicDirs;
		} );
	}
	
	/** 供外界入口调用：初始化监听 renderPort server */
	public async createServer() {
		const packageData = await this.file.loadFile( "package.json", "root" );
		const ADACHI_VERSION = isJsonString( packageData ) ? JSON.parse( packageData ).version || "" : "";
		
		// 向插件配置的静态资源目录内的 html 的 window 对象注入框架版本
		// 这类 html 多是用于渲染图片使用
		this.app.get( /(.*)\.html$/, async ( req, res ) => {
			let template = await this.file.loadFile( `.${ req.path }`, "plugin" );
			if ( !template ) {
				return res.status( 404 ).end( "404 Not Found" );
			}
			template = template.replace(
				/<head>([\w\W]+?)<\/head>/g,
				`<head><script>window.ADACHI_VERSION = "${ ADACHI_VERSION }"</script>$1</head>`
			);
			res.status( 200 ).set( { "Content-Type": "text/html" } ).end( template );
		} );
		
		// 首次启动时，判断当前是否需要监听 renderPort 启动服务
		if ( !this.server && this.shouldListenRenderPort() ) {
			this.server = this.listenerPort();
			this.firstListener = false;
		}
	}
	
	/** 按需重载插件路由和静态资源挂载 */
	public async reloadPluginRouters( pluginKeys?: string[] ) {
		const pluginInstance = PluginManager.getInstance();
		const pluginList = pluginInstance.pluginList;
		
		// 允许只重载指定插件，不传则重载所有插件
		const keys = pluginKeys?.length ? pluginKeys : Object.keys( pluginList );
		
		// 构建新的空白 router
		const nextRouter = express.Router();
		
		// 在新空白 router 上，重新挂载被清除插件的静态资源服务和路由
		keys.forEach( ( key ) => {
			const info = pluginList[key];
			if ( !info ) return;
			
			// 挂载静态资源目录
			const publicDirs = info.publicDirs || [];
			publicDirs.forEach( dir => {
				const path = join( key, dir ).replace( /\\/g, "/" );
				nextRouter.use( "/" + path, express.static( this.file.getFilePath( path, "plugin" ) ) );
			} );
			
			// 挂载插件自定义路由
			info.servers?.forEach( r => {
				nextRouter.use( r.path, r.router );
			} );
		} );
		
		// 直接切换当前路由，上面构造函数里的 pluginRouterHandler 中间键会自动读取到的
		this.currentPluginRouter = nextRouter;
		
		// 判断当前情况决定是否监听 renderPort 开启服务
		const needListen = this.shouldListenRenderPort();
		if ( needListen && !this.server ) {
			this.server = this.listenerPort();
		} else if ( !needListen && this.server ) {
			await this.closePromise();
			this.client.logger.info( `公共 Express 服务已停止（当前没有插件使用 servers/publicDirs）` );
		}
	}
	
	/** 下载/更新 WebConsole 前端静态页面文件 */
	public async downloadConsoleDist() {
		if ( process.env.NODE_ENV !== "production" || !this.config.webConsole.enable ) {
			return;
		}
		
		const baseUrl = "https://mari-files.oss-cn-beijing.aliyuncs.com";
		const { data: onlineInfo } = await axios( `${ baseUrl }/adachi-bot/version3/web_console/info.json`, {
			responseType: "json"
		} );
		
		if ( !onlineInfo || !( await this.isLowerVersion( onlineInfo.version ) ) ) {
			this.client.logger.warn( `本地版本低于远程版本 ${ onlineInfo?.version }，停止自动更新网页控制台页面资源` );
			return;
		}
		
		const assetsInstance = AssetsUpdate.getInstance();
		await assetsInstance.registerCheckUpdateJob(
			undefined,
			"../web-console/dist",
			"web-console",
			{
				manifestUrl: `${ baseUrl }/adachi-bot/version3/web_console_assets_manifest.yml`,
				downloadBaseUrl: baseUrl,
				replacePath: path => path.replace( `adachi-bot/version3/web_console/`, "" )
			},
			{
				startUpdate: async () => {
					await this.file.deleteFile( "src/web-console/dist", "root" );
				},
				updateError: error => {
					// 清单文件不存在时说明版本落后，不作处理
					if ( error.response?.status !== 404 ) {
						this.client.logger.info( error.message );
					}
				}
			}
		);
	}
	
	/** 目标版本是否低于等于当前版本 */
	private async isLowerVersion( targetVersion: string ) {
		const packageData = await this.file.loadFile( "package.json", "root" );
		const currentVersion = isJsonString( packageData ) ? JSON.parse( packageData ).version || "" : "";
		
		if ( !targetVersion || !currentVersion ) {
			return false;
		}
		
		const targetInfo = formatVersion( targetVersion );
		const curInfo = formatVersion( currentVersion );
		
		if ( targetInfo.major < curInfo.major ) {
			return true;
		}
		if ( targetInfo.major === curInfo.major ) {
			if ( targetInfo.minor < curInfo.minor ) {
				return true;
			}
			if ( targetInfo.minor === curInfo.minor ) {
				if ( targetInfo.patch <= curInfo.patch ) {
					return true;
				}
			}
		}
		return false;
	}
	
	public async closePromise(): Promise<void> {
		return new Promise( ( resolve, reject ) => {
			if ( !this.server ) {
				return resolve();
			}
			this.server.close( error => {
				if ( error ) {
					return reject( error );
				}
				this.server = null;
				resolve();
			} );
		} );
	}
	
	private listenerPort() {
		return this.app.listen( this.config.base.renderPort, () => {
			this.client.logger.info( `公共 Express 服务已启动, 端口为: ${ this.config.base.renderPort }` );
			
			const ip = getIPAddress();
			this.client.logger.info( `插件/渲染服务地址: http://${ ip }:${ this.config.base.renderPort }` );
		} );
	}
}
