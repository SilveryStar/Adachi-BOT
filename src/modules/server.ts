import fs from "fs";
import { join, resolve } from "path";
import express from "express";
import { createServer as createViteServer, ViteDevServer } from "vite";
import PluginManager, { ServerRouters } from "@/modules/plugin";
import * as process from "process";
import { BotConfig } from "@/modules/config";
import WebConsole from "@/web-console";
import useWebsocket, { Application } from "express-ws";
import FileManagement from "@/modules/file";
import { Server } from "http";
import { getArrayDifferences, isEqualObject } from "@/utils/object";
import { isJsonString } from "@/utils/verify";
import { Client } from "@/modules/lib";
import { getIPAddress } from "@/utils/network";
import AssetsUpdate from "@/modules/management/assets";
import { getRandomString } from "@/utils/random";
import axios from "axios";
import { formatVersion } from "@/utils/format";

export default class RenderServer {
	private static _instance: RenderServer | null = null;
	private app: Application;
	/** @deprecated 留档备用 */
	private serverRouters: Array<ServerRouters> = [];
	
	private webConsole: WebConsole | null = null;
	private vite: ViteDevServer | null = null;
	private server: Server | null = null;
	private firstListener = true;
	
	constructor(
		private readonly config: BotConfig,
		private readonly file: FileManagement,
		private readonly client: Client
	) {
		const wsInstance = useWebsocket( express() );
		this.app = wsInstance.app;
		config.webConsole.on( "refresh", async ( newCfg, oldCfg ) => {
			if ( newCfg.enable === oldCfg.enable ) {
				return;
			}
			if ( this.webConsole && !newCfg.enable ) {
				await this.webConsole.closePromise();
			}
			await this.reloadServer();
		} )
		this.config.base.on( "refresh", async ( newCfg, oldCfg ) => {
			if ( newCfg.renderPort === oldCfg.renderPort ) {
				return;
			}
			await this.closePromise();
			this.client.logger.info( `原公共服务端口 ${ oldCfg.renderPort } 已关闭` );
			this.server = this.listenerPort();
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
	 * 初版期望于仅刷新插件路由列表，与重启服务功能隔离
	 * @description 务必保证 plugin 实例已被加载后再使用
	 */
	public async reloadPluginRouters( pluginKeys?: string[] ) {
		const pluginInstance = PluginManager.getInstance();
		const pluginList = pluginInstance.pluginList;
		
		// 未传递 pluginKeys 时，清空全部插件路由
		if ( !pluginKeys ) {
			pluginKeys = Object.keys( pluginList );
		}
		
		const pluginKeysRegStr = `(${ pluginKeys!.join( "|" ) })`;
		
		// 清空所有目标插件相关的路由
		if ( this.app._router ) {
			this.app._router.stack = this.app._router.stack.filter( layer => {
				const regSource: string | undefined = layer.regexp?.source;
				if ( !regSource ) return;
				
				return !new RegExp( `^\\^\\\\/${ pluginKeysRegStr }\\\\/` ).test( regSource );
			} );
		}
		
		// 重新挂载被清除插件的静态资源服务和路由
		pluginKeys.forEach( key => {
			const info = pluginList[key];
			if ( !info ) return;
			
			// 挂载静态资源目录
			const publicDirs = info.publicDirs || [];
			publicDirs.forEach( dir => {
				const path = join( key, dir ).replace( /\\/g, "/" );
				this.app.use( "/" + path, express.static( this.file.getFilePath( path, "plugin" ) ) );
			} );
			
			// 挂载路由
			info.servers.forEach( r => {
				this.app.use( r.path, r.router );
			} )
		} )
	}
	
	/* 新增后台服务路由 */
	public addServerRouters( routers: Array<ServerRouters> ) {
		this.serverRouters.push( ...routers );
		// 遍历注册插件 express 路由
		for ( const r of routers ) {
			this.app.use( r.path, r.router );
		}
	}
	
	/**
	 * 重写后台服务路由
	 * @deprecated 留档备用
	 * @param routers
	 */
	private async setServerRouters( routers: Array<ServerRouters> ) {
		// 对比各自新旧路由数组中独有的项目
		const [ onlyOld, onlyNew ] = getArrayDifferences( this.serverRouters, routers, ( oldRouter, newRouter ) => {
			return isEqualObject( oldRouter, newRouter, target => {
				if ( target.constructor.name === "Layer" ) {
					return target.route || true;
				}
				return target;
			} );
		}  );
		// 此时新旧数据本质不同，直接重载服务
		if ( onlyOld.length && this.app._router ) {
			// 从 serverRouters 和 app._router.stack 中删除旧路由
			onlyOld.forEach( route => {
				// 从缓存的服务路由数组中删除
				const routerDelIndex = this.serverRouters.findIndex( r => r.path === route.path );
				this.serverRouters.splice( routerDelIndex, 1 );
				// 从 express 挂载的路由中删除
				const stackDelIndex = this.app._router.stack.findIndex( layer => {
					if ( layer.name !== "router" ) return false;
					return layer.regexp?.test( route.path );
				} );
				this.app._router.stack.splice( stackDelIndex, 1 );
			} );
		}
		
		// 挂载新增路由
		if ( onlyNew.length ) {
			return this.addServerRouters( onlyNew );
		}
		
		// 此时两者相同，不做处理
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
	
	public async downloadConsoleDist() {
		if ( process.env.NODE_ENV !== "production" || !this.config.webConsole.enable ) {
			return;
		}
		
		const baseUrl = "https://mari-files.oss-cn-beijing.aliyuncs.com";
		const { data: onlineInfo } = await axios( `${ baseUrl }/adachi-bot/version3/web_console/info.json`, {
			responseType: "json"
		} );
		
		if ( !onlineInfo || !await this.isLowerVersion( onlineInfo.version ) ) {
			this.client.logger.warn( `本地版本低于远程版本 ${ onlineInfo.version }，停止自动更新网页控制台页面资源` );
			return;
		}
		
		const assetsInstance = AssetsUpdate.getInstance();
		await assetsInstance.registerCheckUpdateJob( undefined, "../web-console/frontend/dist", "web-console", {
			manifestUrl: `${ baseUrl }/adachi-bot/version3/web_console_assets_manifest.yml`,
			downloadBaseUrl: baseUrl,
			replacePath: path => {
				return path.replace( `adachi-bot/version3/web_console/`, "" );
			}
		}, {
			startUpdate: async () => {
				await this.file.deleteFile( "src/web-console/frontend/dist", "root" );
			},
			updateError: ( error ) => {
				// 清单文件不存在时说明版本落后，不作处理
				if ( error.response?.status !== 404 ) {
					this.client.logger.info( error.message );
				}
			}
		} )
	}
	
	/**
	 * 重载服务
	 * @description 仅重启服务，不会更新插件路由列表，需要额外手动校验
	 */
	public async reloadServer() {
		if ( this.vite ) {
			await this.vite.restart();
		}
		await this.closePromise();
		const wsInstance = useWebsocket( express() );
		this.app = wsInstance.app;
		this.client.logger.info( `原公共服务端口 ${ this.config.base.renderPort } 已关闭` );
		this.webConsole?.closePromise();
		await this.createServer();
		await this.reloadPluginRouters();
	}
	
	/* 创建服务 */
	public async createServer() {
		const isProd = process.env.NODE_ENV === "production";
		const packageData = await this.file.loadFile( "package.json", "root" );
		const ADACHI_VERSION = isJsonString( packageData ) ? JSON.parse( packageData ).version || "" : "";
		
		if ( isProd ) {
			this.app.use( express.static( this.file.getFilePath( "src/web-console/frontend/dist", "root" ) ) );
		}
		
		this.app.get(/(.*)\.html$/, async (req, res, next)=>{
			let template = await this.file.loadFile( `.${ req.path }`, "plugin" );
			if ( !template ) {
				return res.status( 404 ).end( "404 Not Found" );;
			}
			template = template.replace(
				/<head>([\w\W]+?)<\/head>/g,
				`<head><script>window.ADACHI_VERSION = "${ ADACHI_VERSION }"</script>$1</head>`
			);
			res.status( 200 ).set( { "Content-Type": "text/html" } ).end( template );
		})
		
		if ( this.config.webConsole.enable ) {
			if ( !isProd ) {
				// 创建 build_setting.yml 文件
				await this.file.createYAML( "src/web-console/frontend/build_setting", {
					upload_token: ""
				}, "root" );
				// 以中间件模式创建 Vite 应用，这将禁用 Vite 自身的 HTML 服务逻辑
				// 并让上级服务器接管控制
				// 执行此方法后将会调用指定 root 目录下的 vite.config.ts
				if ( !this.vite ) {
					this.vite = await createViteServer( {
						base: "/",
						root: this.file.getFilePath( "src/web-console/frontend", "root" ),
						mode: process.env.NODE_ENV || "development",
						server: {
							middlewareMode: true
						},
						appType: "custom"
					} );
				}
				
				// 使用 vite 的 Connect 实例作为中间件
				// 如果你使用了自己的 express 路由（express.Router()），你应该使用 router.use
				this.app.use( this.vite.middlewares );
			}
			await this.file.writeFile( "data/registration_key.txt", getRandomString( 16 ), "root" );
			this.webConsole = new WebConsole( this.app, this.config.webConsole, this.client, this.firstListener );
			this.firstListener = false;
		}
		
		const pluginInstance = PluginManager.getInstance();
		
		this.app.use( '*', async ( req, res, next ) => {
			if ( !this.config.webConsole.enable ) return next();
			
			const baseUrl = req.baseUrl;
			// 如果是 plugin 注册的 server 路由或静态资源目录文件，放行
			for ( const key in pluginInstance.pluginList ) {
				const { servers, publicDirs } = pluginInstance.pluginList[key];
				
				// 校验当前路径是否匹配 plugin 的静态资源目录
				if ( publicDirs?.length ) {
					const regExp = new RegExp( "^/" + join( key, `(${ publicDirs.join( "|" ) })` ).replace( /\\/g, "/" ) );
					if ( regExp.test( baseUrl ) ) return next();
				}
				
				// 校验当前路径是否匹配 plugin 的注册路由
				const findIndex = servers.findIndex( r => {
					if ( r.path === baseUrl ) return true;
					return findRouter( r.router, baseUrl, r.path ) !== -1;
				} );
				
				if ( findIndex !== -1 ) return next();
			}
			
			// 网页控制台静态页面地址
			const htmlPath = isProd ? "../web-console/frontend/dist/index.html" : "../web-console/frontend/index.html";
			
			const url = req.originalUrl;
			try {
				let template = fs.readFileSync( resolve( __dirname, htmlPath ), "utf-8" );
				if ( this.vite ) {
					// 应用 Vite HTML 转换。这将会注入 Vite HMR 客户端，同时也会从 Vite 插件应用 HTML 转换。
					template = await this.vite.transformIndexHtml( url, template );
				}
				
				// 6. 返回渲染后的 HTML。
				res.status( 200 ).set( { "Content-Type": "text/html" } ).end( template );
			} catch ( e ) {
				// 捕获到了一个错误后，后让 Vite 修复该堆栈，并映射回实际源码中。
				const err: Error = <Error>e;
				this.vite?.ssrFixStacktrace( err );
				this.client.logger.error( err.stack );
				res.status( 500 ).end( err.stack );
			}
		} );
		
		if ( !this.server ) {
			this.server = this.listenerPort();
		}
	}
	
	private closePromise(): Promise<void> {
		return new Promise( ( resolve, reject ) => {
			if ( this.server ) {
				this.server.close( ( error ) => {
					if ( error ) {
						reject( error );
					} else {
						this.server = null;
						resolve();
					}
				} );
			} else {
				resolve();
			}
		} )
	}
	
	private listenerPort() {
		return this.app.listen( this.config.base.renderPort, () => {
			this.client.logger.info( `公共 Express 服务已启动, 端口为: ${ this.config.base.renderPort }` );
			if ( this.config.webConsole.enable ) {
				const ip = getIPAddress();
				this.client.logger.info( `网页控制台已启动，请浏览器打开 http://${ ip }:${ this.config.base.renderPort } 查看。若为 docker 部署，请将 ${ ip } 替换为服务器的公网ip。` )
			}
		} )
	}
}

/* 查找 path 匹配的 express router */
function findRouter( router: any, target: string, base: string ): number {
	return router.stack.findIndex( r => {
		if ( !r.route || r.route.path === "/" ) return false;
		const itemBase = base + r.route.path;
		if ( itemBase === target ) {
			return true;
		}
		return findRouter( r.route, target, itemBase ) !== -1;
	} )
}