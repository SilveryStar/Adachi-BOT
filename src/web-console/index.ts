import { resolve } from "path";
import { scheduleJob } from "node-schedule";
import { createServer, Server } from "net";
import { expressjwt as jwt } from "express-jwt";
import { BotConfig } from "@/modules/config";
import { Application } from "express-ws";
import express, { Router } from "express";
import * as r from "./backend/routes";
import { getTokenByRequest } from "./backend/utils/request";
import { LogMessage } from "@/web-console/types/logger";
import { Logger } from "log4js";

interface Ref<T> {
	value: T;
}

const ref = <T>( value: T ): Ref<T> => ( { value } );

export default class WebConsole {
	private server: Server | null = null;
	
	constructor(
		private readonly app: Application,
		private readonly config: BotConfig["webConsole"],
		private readonly logger: Logger,
		firstListener: boolean
	) {
		this.createConsole( firstListener );
	}
	
	private async createConsole( firstListener: boolean ) {
		this.app.use( "/oicq/data", express.static( resolve( process.cwd(), "data" ) ) );
		this.app.use( express.json() );
		this.app.use( express.urlencoded( { extended: false } ) );
		
		/* 创建接口 */
		this.useApi( "/api/check", r.CheckRouter, false );
		this.useApi( "/api/login", r.LoginRouter, false );
		this.useApi( "/api/bot", r.BaseRouter );
		this.useApi( "/api/log", r.LogRouter );
		this.useApi( "/api/user", r.UserRouter );
		this.useApi( "/api/group", r.GroupRouter );
		this.useApi( "/api/message", r.MessageRouter );
		this.useApi( "/api/config", r.ConfigRouter );
		
		let messageCache = ref( "" );
		this.app.ws( "/ws/log", ( ws, req ) => {
			messageCache.value = "";
			const cron: string = "*/2 * * * * ?";
			const job = scheduleJob( cron, () => {
				if ( messageCache.value.length !== 0 ) {
					const data: LogMessage[] = messageCache.value.split( "__ADACHI__" )
						.filter( el => el.length !== 0 )
						.map( el => JSON.parse( el ) );
					ws.send( JSON.stringify( data ) );
					messageCache.value = "";
				}
			} );
			ws.on( "close", () => job.cancel() && ws.close() );
		} );
		
		/* 捕获错误 */
		this.app.use( WebConsole.ApiErrorCatch );
		this.server = this.createTcpServer( this.config.tcpLoggerPort, messageCache );
		if ( firstListener ) {
			this.config.on( "refresh", async ( newCfg, oldCfg ) => {
				if ( newCfg.tcpLoggerPort !== oldCfg.tcpLoggerPort ) {
					await this.closePromise();
					this.server = this.createTcpServer( newCfg.tcpLoggerPort, messageCache );
				}
			} );
		}
	}
	
	public closePromise(): Promise<void> {
		return new Promise( ( resolve, reject ) => {
			if ( this.server ) {
				this.server.close( ( error ) => {
					if ( error ) {
						reject( error );
					} else {
						this.logger.info( `原tcp端口已关闭` )
						this.server = null;
						resolve();
					}
				} );
			} else {
				resolve();
			}
		} )
	}
	
	private createTcpServer( tcp: number, msg: Ref<string> ) {
		return createServer( socket => {
			socket.setEncoding( "utf-8" );
			socket.on( "data", res => {
				msg.value += res;
			} );
		} ).listen( tcp, () => {
			this.logger.info( "tcp服务启动" );
		} );
	}
	
	private static ApiErrorCatch( err, req, res, next ) {
		switch ( err.name ) {
			case "UnauthorizedError":
				res.status( 401 ).send( {
					code: 401,
					msg: "Please login.",
					data: 0
				} );
				break;
		}
	}
	
	/* 此处没有用 app.use+jwt.unless 进行全局隔离 */
	
	/* WebSocket 疑似无法被过滤 所有 ws 连接被拦截 */
	private static JWT( secret: string ) {
		return jwt( {
			secret,
			algorithms: [ "HS256" ],
			getToken( req ) {
				return getTokenByRequest( req );
			}
		} );
	}
	
	private useApi( path: string, router: Router, token: boolean = true ): void {
		if ( token ) {
			this.app.use( path, ( req, res, next ) => {
				return WebConsole.JWT( this.config.jwtSecret )( req, res, next );
			}, router );
		} else {
			this.app.use( path, router );
		}
	}
}