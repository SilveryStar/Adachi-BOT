import { resolve } from "path";
import { scheduleJob } from "node-schedule";
import { expressjwt as jwt } from "express-jwt";
import express, { Router } from "express";
import useWebsocket, { Application } from "express-ws";
import { BotConfig } from "@/modules/config";
import * as r from "./routes";
import { getTokenByRequest } from "@/web-console/utils/request";
import { LogMessage } from "@/web-console/types/logger";
import { Client } from "@/modules/lib";
import FileManagement from "@/modules/file";
import { getIPAddress } from "@/utils/network";
import type { Server as HttpServer } from "http";
import { logChannel } from "@/modules/lib/core/logger";

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
	
	/* 日志相关 */
	private logClients = new Set<any>();
	private logJob: ReturnType<typeof scheduleJob> | null = null;
	// 取消日志 ws 订阅方法
	private unsubscribeLog: ( () => void ) | null = null;
	
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
		if ( this.httpServer ) {
			await this.stopServers();
		}
		this.client.logger.info( "WebUI 已禁用（config.webConsole.enable = false）" );
	}
	
	private async startServers() {
		this.mountRoutesOnce();
		// 日志订阅服务
		this.ensureLogSubscribedOnce();
		// api服务
		if ( !this.httpServer ) {
			this.httpServer = this.listenHttp();
		}
	}
	
	private listenHttp() {
		return this.app.listen( this.config.port, () => {
			const ip = getIPAddress();
			this.client.logger.info( `网页控制台已启动: http://${ ip }:${ this.config.port }` );
			this.client.logger.info( `提示：若为 docker 部署，请将 ${ ip } 替换为服务器公网 IP` );
		} );
	}
	
	private async stopServers() {
		await this.closeHttpPromise();
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
	
	private ensureLogSubscribedOnce() {
		if ( this.unsubscribeLog ) return;
		
		this.unsubscribeLog = logChannel.subscribe( ( msg: LogMessage ) => {
			this.messageCache.value += JSON.stringify( msg ) + "__ADACHI__";
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
		
		/**
		 * WS log 日志相关
		 * @description 侧重点：避免打开多个页面时，即存在多个 ws 链接 + 创建多个 job 时导致的日志跳跃问题
		 */
		this.app.ws( "/ws/log", ws => {
			this.logClients.add( ws );
			
			// 仅第一次连接时创建一个 job 任务
			if ( !this.logJob ) {
				this.logJob = scheduleJob( "*/2 * * * * *", () => {
					if ( this.messageCache.value.length === 0 ) return;
					
					// 省的在后面 catch 那里再多写一次清空 messageCache
					const cache = this.messageCache.value;
					this.messageCache.value = "";
					
					const data: LogMessage[] = cache
						.split( "__ADACHI__" )
						.filter( el => el.length !== 0 )
						.map( el => JSON.parse( el ) );
					
					const payload = JSON.stringify( data );
					
					for ( const c of this.logClients ) {
						try {
							c.send( payload );
						} catch {
							// 忽略单个连接发送失败
						}
					}
				} );
			}
			
			ws.on( "close", () => {
				this.logClients.delete( ws );
				
				// 没有客户端了就停掉定时任务
				if ( this.logClients.size === 0 && this.logJob ) {
					this.logJob.cancel();
					this.logJob = null;
				}
				
				ws.close();
			} );
		} );
		
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
		const distDir = this.file.getFilePath( "src/web-console/dist", "root" );
		
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
