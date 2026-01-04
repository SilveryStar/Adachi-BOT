import { resolve } from "path";
import { scheduleJob } from "node-schedule";
import { createServer, Server as TcpServer } from "net";
import { expressjwt as jwt } from "express-jwt";
import express, { Router } from "express";
import useWebsocket, { Application } from "express-ws";
import { BotConfig } from "@/modules/config";
import * as r from "./backend/routes";
import { getTokenByRequest } from "./backend/utils/request";
import { LogMessage } from "./backend/types/logger";
import { Client } from "@/modules/lib";
import FileManagement from "@/modules/file";
import { getIPAddress } from "@/utils/network";
import type { Server as HttpServer } from "http";

interface Ref<T> {
	value: T;
}

const ref = <T>( value: T ): Ref<T> => ( { value } );

/**
 * WebConsole 独立端口后台服务
 */
export default class WebConsole {
	private app: Application;
	private mounted = false;
	private messageCache = ref( "" );
	private httpServer: HttpServer | null = null;
	private tcpServer: TcpServer | null = null;
	
	constructor(
		private readonly config: BotConfig["webConsole"],
		private readonly file: FileManagement,
		private readonly client: Client,
		firstListener: boolean
	) {
		const wsInstance = useWebsocket( express() );
		this.app = wsInstance.app;
		
		// 只注册一次热刷新监听，避免重复绑定
		if ( firstListener ) {
			this.config.on( "refresh", async ( newCfg, oldCfg ) => {
				await this.handleRefresh( newCfg, oldCfg );
			} );
		}
		
		// 启动时根据 enable 决定是否启动
		this.ensureStateByEnable();
	}
	
	private async ensureStateByEnable() {
		if ( this.config.enable ) {
			await this.startServers();
			return;
		}
		// 此时 enable=false，检查服务是否在开启状态，如果是则关闭
		if ( this.httpServer || this.tcpServer ) {
			await this.stopServers();
		}
		this.client.logger.info( "WebUI 已禁用（config.webConsole.enable = false）" );
	}
	
	private async startServers() {
		this.mountRoutesOnce();
		// api服务
		if ( !this.httpServer ) {
			this.httpServer = this.listenHttp();
		}
		// 日志服务
		if ( !this.tcpServer ) {
			this.tcpServer = this.createTcpServer( this.config.tcpLoggerPort );
		}
	}
	
	private listenHttp() {
		return this.app.listen( this.config.port, () => {
			const ip = getIPAddress();
			this.client.logger.info( `网页控制台已启动: http://${ ip }:${ this.config.port }` );
			this.client.logger.info( `提示：若为 docker 部署，请将 ${ ip } 替换为服务器公网 IP` );
		} );
	}
	
	private createTcpServer( tcp: number ) {
		return createServer( socket => {
			socket.setEncoding( "utf-8" );
			socket.on( "data", ( res ) => {
				this.messageCache.value += res;
			} );
		} ).listen( tcp, () => {
			this.client.logger.info( "tcp服务启动" );
		} );
	}
	
	private async stopServers() {
		await this.closeHttpPromise();
		await this.closeTcpPromise();
	}
	
	private closeHttpPromise(): Promise<void> {
		return new Promise( ( resolve, reject ) => {
			if ( !this.httpServer ) {
				return resolve();
			}
			this.httpServer.close( error => {
				if ( error ) {
					return reject( error );
				}
				this.client.logger.info( `原 WebConsole 端口已关闭` );
				this.httpServer = null;
				resolve();
			} );
		} );
	}
	
	private closeTcpPromise(): Promise<void> {
		return new Promise( ( resolve, reject ) => {
			if ( !this.tcpServer ) {
				return resolve();
			}
			const listenerTcpServerClose = () => {
				this.client.logger.info( `原 tcp 端口已关闭` );
				this.tcpServer?.off( "close", listenerTcpServerClose );
				this.tcpServer = null;
				resolve();
			}
			
			// 监听 on 事件，若仅依赖 close 方法的话，可能会出现未完全关闭导致端口冲突的情况
			this.tcpServer.on( "close", listenerTcpServerClose );
			this.tcpServer.close( error => {
				if ( !error ) return;
				reject( error );
			} );
		} );
	}
	
	private mountRoutesOnce() {
		if ( this.mounted ) return;
		this.mounted = true;
		
		this.app.use( "/oicq/data", express.static( resolve( process.cwd(), "data" ) ) );
		this.app.use( express.json() );
		this.app.use( express.urlencoded( { extended: false } ) );
		
		// WebConsole 后端API
		this.useApi( "/api/check", r.CheckRouter, false );
		this.useApi( "/api/login", r.LoginRouter, false );
		this.useApi( "/api/account", r.AccountRouter, false );
		this.useApi( "/api/bot", r.BaseRouter );
		this.useApi( "/api/log", r.LogRouter );
		this.useApi( "/api/user", r.UserRouter );
		this.useApi( "/api/group", r.GroupRouter );
		this.useApi( "/api/message", r.MessageRouter );
		this.useApi( "/api/config", r.ConfigRouter );
		
		// WS log 日志相关
		this.app.ws( "/ws/log", ws => {
			this.messageCache.value = "";
			const job = scheduleJob( "*/2 * * * * *", () => {
				if ( this.messageCache.value.length !== 0 ) {
					const data: LogMessage[] = this.messageCache.value
						.split( "__ADACHI__" )
						.filter( ( el ) => el.length !== 0 )
						.map( ( el ) => JSON.parse( el ) );
					ws.send( JSON.stringify( data ) );
					this.messageCache.value = "";
				}
			} );
			ws.on( "close", () => {
				job.cancel();
				ws.close();
			} );
		} );
		
		// WebConsole 生产环境静态资源
		const distDir = this.file.getFilePath( "src/web-console/frontend/dist", "root" );
		
		// 设置缓存
		this.app.use(
			express.static( distDir, {
				setHeaders: ( res, p ) => {
					// /assets 里的文件一般带 hash，强缓存处理
					if ( p.includes( `${ resolve( distDir, "assets" ) }` ) ) {
						res.setHeader( "Cache-Control", "public, max-age=31536000, immutable" );
						return;
					}
					// index.html 等名称路径固定的文件，采用短时缓存，避免前端文件升级后不生效
					res.setHeader( "Cache-Control", "public, max-age=60" );
				}
			} )
		);
		
		// 前端 SPA 应用的后端路由处理
		this.app.get( "*", ( req, res, next ) => {
			const p = req.path;
			
			// 后端 API 和 ws 放行
			if ( p.startsWith( "/api/" ) || p.startsWith( "/ws/" ) ) return next();
			
			// 带扩展名的一般是资源文件，丢给 static 处理
			if ( /\.[a-zA-Z0-9]+$/.test( p ) ) return next();
			// 最后 404 的都返回 index.html 交给前端路由处理
			return res.sendFile( resolve( distDir, "index.html" ) );
		} );
		
		this.app.use( WebConsole.ApiErrorCatch );
	}
	
	// 处理执行了 #refresh 刷新配置项指令后的操作
	private async handleRefresh( newCfg: any, oldCfg: any ) {
		if ( newCfg.enable !== oldCfg.enable ) {
			await this.ensureStateByEnable();
		}
		// 如果 enable 本来就没开，后续其他配置变更不做处理
		if ( !newCfg.enable ) return;
		
		// port 端口变化后，重启 api 服务器
		if ( newCfg.port !== oldCfg.port ) {
			await this.closeHttpPromise();
			this.httpServer = this.listenHttp();
		}
		
		// tcpLoggerPort 端口变化后，重启 tcp 日志服务器
		if ( newCfg.tcpLoggerPort !== oldCfg.tcpLoggerPort ) {
			await this.closeTcpPromise();
			this.tcpServer = this.createTcpServer( newCfg.tcpLoggerPort );
		}
	}
	
	// 通用的 api 错误捕获中间件
	private static ApiErrorCatch( err, req, res, next ) {
		switch ( err.name ) {
			case "RequestParamsError":
				res.status( 400 ).send( { code: 400, data: {}, msg: err.message } );
				break;
			case "UnauthorizedError":
				res.status( 401 ).send( { code: 401, msg: "Please login.", data: 0 } );
				break;
			default:
				res.status( 500 ).send( { code: 500, data: [], msg: err.message || "Server Error" } );
		}
	}
	
	// 通用 JWT 鉴权中间件生成方法
	private static JWT( secret: string ) {
		return jwt( {
			secret,
			algorithms: [ "HS256" ],
			getToken( req ) {
				return getTokenByRequest( req );
			}
		} );
	}
	
	// 通用的 api 挂载方法，自动处理 jwt 鉴权
	private useApi( path: string, router: Router, token: boolean = true ): void {
		if ( token ) {
			this.app.use( path, ( req, res, next ) => {
					WebConsole.JWT( this.config.jwtSecret )( req, res, next )
				},
				router );
		} else {
			this.app.use( path, router );
		}
	}
}
