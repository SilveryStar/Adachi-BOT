import fs from "fs";
import { resolve } from "path";
import express from "express";
import { createServer as createViteServer, ViteDevServer } from "vite";
import { PluginInfo, ServerRouters } from "@/modules/plugin";
import * as process from "process";
import { BotConfig } from "@/modules/config";
import WebConsole from "@/web-console";
import useWebsocket, { Application } from "express-ws";
import FileManagement from "@/modules/file";
import { Server } from "http";
import { isEqualObject } from "@/utils/object";
import { isJsonString } from "@/utils/verify";
import { Client } from "@/modules/lib";
import os from "os";
import { getIPAddress } from "@/utils/network";
import AssetsUpdate from "@/modules/management/assets";

export default class RenderServer {
	private static _instance: RenderServer | null = null;
	private app: Application;
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
		this.createServer().catch();
		config.webConsole.on( "refresh", async ( newCfg, oldCfg ) => {
			if ( newCfg.enable === oldCfg.enable ) {
				return;
			}
			if ( this.webConsole && !newCfg.enable ) {
				await this.webConsole.closePromise();
			}
			await this.reloadServer();
			for ( const r of this.serverRouters ) {
				this.app.use( r.path, r.router );
			}
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
	
	public async reloadPluginRouters( pluginList: Record<string, PluginInfo> ) {
		const serverRoutes: ServerRouters[] = [];
		for ( const pluginInfo of Object.values( pluginList ) ) {
			serverRoutes.push( ...pluginInfo.servers );
		}
		// 设置插件路由
		await this.setServerRouters( serverRoutes );
	}
	
	/* 新增后台服务路由 */
	public addServerRouters( routers: Array<ServerRouters> ) {
		this.serverRouters.push( ...routers );
		// 遍历注册插件 express 路由
		for ( const r of routers ) {
			this.app.use( r.path, r.router );
		}
	}
	
	/* 重写后台服务路由 */
	public async setServerRouters( routers: Array<ServerRouters> ) {
		const different = this.serverRouters.filter( oldRouter => {
			return routers.findIndex( newRouter => isEqualObject( oldRouter, newRouter, target => {
				if ( target.constructor.name === "Layer" ) {
					return target.route || true;
				}
				return target;
			} ) ) === -1;
		} );
		// 此时新旧数据本质不同，直接重载服务
		if ( different.length ) {
			this.serverRouters = routers;
			return await this.reloadServer();
		}
		// 此时两者相同，不作处理
		if ( this.serverRouters.length === routers.length ) {
			return;
		}
		// 此时仅存在新增服务，依次加载即可
		this.addServerRouters( routers );
	}
	
	public async downloadConsoleDist() {
		if ( process.env.NODE_ENV !== "production" || !this.config.webConsole.enable ) {
			return;
		}
		const packageData = await this.file.loadFile( "src/web-console/frontend/package.json", "root" );
		const WBB_CONSOLE_VERSION = isJsonString( packageData ) ? JSON.parse( packageData ).version || "" : "";
		
		const assetsInstance = AssetsUpdate.getInstance();
		await assetsInstance.registerCheckUpdateJob( undefined, "../web-console/frontend/dist", "web-console", {
			manifestUrl: `https://files.yatserver.com/adachi-bot/Version3/web-console-${ WBB_CONSOLE_VERSION }_assets_manifest.yml`,
			downloadBaseUrl: "https://files.yatserver.com/adachi-bot",
			replacePath: path => {
				return path.replace( `adachi-bot/version3/web-console-${ WBB_CONSOLE_VERSION }/`, "" );
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
	
	/* 重载服务 */
	public async reloadServer() {
		if ( this.vite ) {
			await this.vite.restart();
		}
		await this.closePromise();
		const wsInstance = useWebsocket( express() );
		this.app = wsInstance.app;
		this.client.logger.info( `原公共服务端口 ${ this.config.base.renderPort } 已关闭` );
		await this.createServer();
		for ( const r of this.serverRouters ) {
			this.app.use( r.path, r.router );
		}
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
		
		// 为插件目录挂载静态资源服务
		const pluginDirList = await this.file.getDirFiles( "src/plugins", "root" );
		for ( const plugin of pluginDirList ) {
			this.app.use( `/${ plugin }`, express.static( this.file.getFilePath( plugin, "plugin" ) ) );
		}
		
		if ( this.config.webConsole.enable ) {
			if ( !isProd ) {
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
			this.webConsole = new WebConsole( this.app, this.config.webConsole, this.client, this.firstListener );
			this.firstListener = false;
		}
		
		this.app.use( '*', async ( req, res, next ) => {
			if ( !this.config.webConsole.enable ) {
				return next();
			}
			
			const baseUrl = req.baseUrl;
			// 如果是 plugin 注册的 server 路由，放行
			const isRenderRouter = this.serverRouters.findIndex( r => {
				if ( r.path === baseUrl ) return true;
				return findRouter( r.router, baseUrl, r.path ) !== -1;
			} ) !== -1;
			if ( isRenderRouter ) {
				return next();
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