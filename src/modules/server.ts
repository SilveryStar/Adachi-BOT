import fs from "fs";
import { resolve } from "path";
import express, { Express } from "express";
import { Logger } from "log4js";
import { createServer as createViteServer, ViteDevServer } from "vite";
import { RenderRoutes, ServerRouters } from "@/types/render";
import * as process from "process";
import BotConfig from "@/modules/config";
import WebConsole from "@/web-console";
import useWebsocket, { Application } from "express-ws";

export default class RenderServer {
	private readonly app: Application;
	private serverRouters: Array<ServerRouters> = [];
	private renderRoutes: Array<RenderRoutes> = [];
	private isFirstListen: boolean = true;
	
	constructor( config: BotConfig, logger: Logger ) {
		const wsInstance = useWebsocket( express() );
		this.app = wsInstance.app;
		this.createServer( config, logger ).catch();
	}
	
	public setServerRouters( routers: Array<ServerRouters> ) {
		this.serverRouters = routers;
		// 遍历注册插件 express 路由
		for ( const r of routers ) {
			this.app.use( r.path, r.router );
		}
	}
	
	public setRenderRoutes( routes: Array<RenderRoutes> ) {
		this.renderRoutes = routes;
	}
	
	public async createServer( config: BotConfig, logger: Logger ) {
		const isProd = process.env.NODE_ENV === "production";
		
		let vite: ViteDevServer | null = null;
		
		if ( isProd ) {
			// 为打包目录挂载静态资源服务
			this.app.use( "/dist/", express.static( resolve( __dirname, "../../dist" ) ) );
		} else {
			// 以中间件模式创建 Vite 应用，这将禁用 Vite 自身的 HTML 服务逻辑
			// 并让上级服务器接管控制
			// 执行此方法后将会调用指定 root 目录下的 vite.config.ts
			vite = await createViteServer( {
				base: "/",
				root: process.cwd(),
				server: { middlewareMode: true },
				appType: "custom"
			} );
			
			// 使用 vite 的 Connect 实例作为中间件
			// 如果你使用了自己的 express 路由（express.Router()），你应该使用 router.use
			this.app.use( vite.middlewares );
		}
		
		// 为插件目录挂载静态资源服务
		this.app.use( express.static( resolve( __dirname, "../plugins" ) ) );
		
		if ( config.webConsole.enable ) {
			new WebConsole( this.app, config );
		}
		
		this.app.use( '*', async ( req, res, next ) => {
			const baseUrl = req.baseUrl;
			// 如果是 render 注册路由，放行
			const isRenderRouter = this.serverRouters.findIndex( r => r.path === baseUrl ) !== -1;
			if ( isRenderRouter ) {
				return next();
			}
			
			// 是否是插件前端渲染路由
			const isRenderRoute = this.renderRoutes.findIndex( r => r.path === baseUrl ) !== -1;
			let htmlPath: string;
			if ( vite ) {
				htmlPath = isRenderRoute ? "../render/index.html" : "../web-console/index.html";
			} else {
				htmlPath = isRenderRoute ? "../../dist/src/render/index.html" : "../../dist/src/web-console/index.html";
			}
			
			const url = req.originalUrl;
			try {
				let template = fs.readFileSync( resolve( __dirname, htmlPath ), "utf-8" );
				if ( vite ) {
					// 应用 Vite HTML 转换。这将会注入 Vite HMR 客户端，同时也会从 Vite 插件应用 HTML 转换。
					template = await vite.transformIndexHtml( url, template );
				}
				// 注入生成的 vue-router 对象
				if ( isRenderRoute ) {
					template = template.replace( `<!--adachi-routes-->`, `window.__ADACHI_ROUTES__ = ${ JSON.stringify( this.renderRoutes ) }` );
				}
				
				// 6. 返回渲染后的 HTML。
				res.status( 200 ).set( { "Content-Type": "text/html" } ).end( template );
			} catch ( e ) {
				// 捕获到了一个错误后，后让 Vite 修复该堆栈，并映射回实际源码中。
				const err: Error = <Error>e;
				vite?.ssrFixStacktrace( err );
				console.log( err.stack );
				res.status( 500 ).end( err.stack );
			}
		} );
		if ( this.isFirstListen ) {
			this.isFirstListen = false;
			this.app.listen( config.renderPort, () => {
				logger.info( `公共 Express 服务已启动, 端口为: ${ config.renderPort }` );
				if ( config.webConsole.enable ) {
					console.log( `网页控制台已启动，请浏览器打开 http://127.0.0.1:${ config.renderPort } 查看，若为云服务器，请将 127.0.0.1 替换为服务器的公网ip。` )
				}
			} );
		}
	}
}