import fs from "fs";
import { resolve } from "path";
import express from "express";
import { Logger } from "log4js";
import { createServer as createViteServer, ViteDevServer } from "vite";
import { PluginInfo, RenderRoutes, ServerRouters } from "@/modules/plugin";
import * as process from "process";
import { BotConfig } from "@/modules/config";
import WebConsole from "@/web-console";
import useWebsocket, { Application } from "express-ws";
import FileManagement from "@/modules/file";
import { Server } from "http";
import { isEqualObject } from "@/utils/object";
import { isJsonString } from "@/utils/verify";

export default class RenderServer {
	private static _instance: RenderServer | null = null;
	private app: Application;
	private serverRouters: Array<ServerRouters> = [];
	private renderRoutes: Array<RenderRoutes> = [];
	private webConsole: WebConsole | null = null;
	private vite: ViteDevServer | null = null;
	private server: Server | null = null;
	private firstListener = true;
	
	constructor(
		private readonly config: BotConfig,
		private readonly file: FileManagement,
		private readonly logger: Logger
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
			this.logger.info( `原公共服务端口 ${ oldCfg.renderPort } 已关闭` );
			this.server = this.listenerPort();
		} );
	}
	
	public static getInstance( config?: BotConfig, file?: FileManagement, logger?: Logger ): RenderServer {
		if ( !RenderServer._instance ) {
			if ( !config || !file || !logger ) {
				throw new Error( "获取 server 实例出错" );
			}
			RenderServer._instance = new RenderServer( config, file, logger );
		}
		return RenderServer._instance;
	}
	
	public async reloadPluginRouters( pluginList: Record<string, PluginInfo> ) {
		const serverRoutes: ServerRouters[] = [];
		const renderRoutes: RenderRoutes[] = [];
		for ( const pluginInfo of Object.values(pluginList) ) {
			renderRoutes.push( ...pluginInfo.renders );
			serverRoutes.push( ...pluginInfo.servers );
		}
		// 设置插件路由
		this.setRenderRoutes( renderRoutes );
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
	
	public setRenderRoutes( routes: Array<RenderRoutes> ) {
		this.renderRoutes = routes;
	}
	
	/* 重载服务 */
	public async reloadServer() {
		if ( this.vite ) {
			await this.vite.restart();
		}
		await this.closePromise();
		const wsInstance = useWebsocket( express() );
		this.app = wsInstance.app;
		this.logger.info( `原公共服务端口 ${ this.config.base.renderPort } 已关闭` );
		await this.createServer();
		for ( const r of this.serverRouters ) {
			this.app.use( r.path, r.router );
		}
	}
	
	/* 创建服务 */
	public async createServer() {
		const isBuild = process.env.NODE_ENV === "build";
		const packageData = this.file.loadFile( "package.json", "root" );
		const ADACHI_VERSION = isJsonString( packageData ) ? JSON.parse( packageData ).version || "" : "";
		
		if ( isBuild ) {
			// 为打包目录挂载静态资源服务
			this.app.use( express.static( resolve( __dirname, "../../dist" ) ) );
		} else {
			// 以中间件模式创建 Vite 应用，这将禁用 Vite 自身的 HTML 服务逻辑
			// 并让上级服务器接管控制
			// 执行此方法后将会调用指定 root 目录下的 vite.config.ts
			if ( !this.vite ) {
				this.vite = await createViteServer( {
					base: "/",
					root: process.cwd(),
					mode: process.env.NODE_ENV || "development",
					server: { middlewareMode: true },
					appType: "custom"
				} );
			}
			
			// 使用 vite 的 Connect 实例作为中间件
			// 如果你使用了自己的 express 路由（express.Router()），你应该使用 router.use
			this.app.use( this.vite.middlewares );
		}
		
		// 为插件目录挂载静态资源服务
		// this.app.use( express.static( resolve( __dirname, "../plugins" ) ) );
		for ( const plugin of this.file.getDirFiles( "src/plugins", "root" ) ) {
			this.app.use( `/${ plugin }`, express.static( this.file.getFilePath( plugin, "plugin" ) ) );
		}
		
		if ( this.config.webConsole.enable ) {
			this.webConsole = new WebConsole( this.app, this.config.webConsole, this.logger, this.firstListener );
			this.firstListener = false;
		}
		
		this.app.use( '*', async ( req, res, next ) => {
			const baseUrl = req.baseUrl;
			// 如果是 render 注册路由，放行
			const isRenderRouter = this.serverRouters.findIndex( r => {
				if ( r.path === baseUrl ) return true;
				return findRouter( r.router, baseUrl, r.path ) !== -1;
			} ) !== -1;
			if ( isRenderRouter ) {
				return next();
			}
			
			// 是否是插件前端渲染路由
			const isRenderRoute = this.renderRoutes.findIndex( r => r.path === baseUrl ) !== -1;
			// 是否渲染插件前端页面而非控制台页面
			const renderRender = isRenderRoute || !this.config.webConsole.enable;
			let htmlPath: string;
			if ( this.vite ) {
				htmlPath = renderRender ? "../render/index.html" : "../web-console/frontend/index.html";
			} else {
				htmlPath = renderRender ? "../../dist/src/render/index.html" : "../../dist/src/web-console/index.html";
			}
			
			const url = req.originalUrl;
			try {
				let template = fs.readFileSync( resolve( __dirname, htmlPath ), "utf-8" );
				if ( this.vite ) {
					// 应用 Vite HTML 转换。这将会注入 Vite HMR 客户端，同时也会从 Vite 插件应用 HTML 转换。
					template = await this.vite.transformIndexHtml( url, template );
				}
				// 注入生成的 vue-router 对象
				if ( isRenderRoute ) {
					template = template.replace( `<!--adachi-routes-->`, `
					window.__ADACHI_ROUTES__ = ${ JSON.stringify( this.renderRoutes ) };
					window.ADACHI_VERSION = "${ ADACHI_VERSION }"
					` );
				}
				
				// 6. 返回渲染后的 HTML。
				res.status( 200 ).set( { "Content-Type": "text/html" } ).end( template );
			} catch ( e ) {
				// 捕获到了一个错误后，后让 Vite 修复该堆栈，并映射回实际源码中。
				const err: Error = <Error>e;
				this.vite?.ssrFixStacktrace( err );
				this.logger.error( err.stack );
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
			this.logger.info( `公共 Express 服务已启动, 端口为: ${ this.config.base.renderPort }` );
			if ( this.config.webConsole.enable ) {
				console.log( `网页控制台已启动，请浏览器打开 http://127.0.0.1:${ this.config.base.renderPort } 查看，若为云服务器，请将 127.0.0.1 替换为服务器的公网ip。` )
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