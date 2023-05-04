import { resolve } from "path";
import { scheduleJob } from "node-schedule";
import { createServer } from "net";
import { expressjwt as jwt } from "express-jwt";
import BotConfig from "@/modules/config";
import { Application } from "express-ws";
import express, { Router } from "express";
import * as r from "./backend/routes";
import { getTokenByRequest } from "./backend/utils/request";
import { LogMessage } from "@/types/logger";

export default class WebConsole {
	private readonly app: Application;
	private readonly secret: string;
	
	constructor( app: Application, config: BotConfig ) {
		this.app = app;
		const cfg = config.webConsole;
		
		this.secret = cfg.jwtSecret;
		if ( !this.secret ) {
			console.log( "请检查 setting.yml 中是否正确填写 jwtSecret 验证秘钥（6~16 位的字母或数字）" );
			process.exit( 0 );
		}
		this.createConsole( cfg.tcpLoggerPort );
	}
	
	private async createConsole( tcp: number ) {
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
		
		let messageCache: string = "";
		this.app.ws( "/ws/log", ( ws, req ) => {
			messageCache = "";
			const cron: string = "*/2 * * * * ?";
			const job = scheduleJob( cron, () => {
				if ( messageCache.length !== 0 ) {
					const data: LogMessage[] = messageCache.split( "__ADACHI__" )
						.filter( el => el.length !== 0 )
						.map( el => JSON.parse( el ) );
					ws.send( JSON.stringify( data ) );
					messageCache = "";
				}
			} );
			ws.on( "close", () => job.cancel() && ws.close() );
		} );
		
		/* 捕获错误 */
		this.app.use( WebConsole.ApiErrorCatch );
		createServer( socket => {
			socket.setEncoding( "utf-8" );
			socket.on( "data", res => {
				messageCache += res;
			} );
		} ).listen( tcp );
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
			this.app.use( path, WebConsole.JWT( this.secret ), router );
		} else {
			this.app.use( path, router );
		}
	}
}