import { resolve } from "path";
import { scheduleJob } from "node-schedule";
import { createServer } from "net";
import jwt from "express-jwt";
import bodyParser from "body-parser";
import BotConfig from "@modules/config";
import useWebsocket from "express-ws";
import express, { Express } from "express";
import { Router } from 'express-serve-static-core';

import CheckRouter from "./routes/check";
import LoginRouter from "./routes/login";
import LogRouter from "./routes/log";
import UserRouter from "./routes/user";
import StatRouter from "./routes/stat";

export default class WebConsole {
	private readonly app: Express;
	private readonly secret: string;
	private isFirstListen: boolean = true;
	
	constructor( config: BotConfig ) {
		const cfg = config.webConsole;
		
		this.secret = cfg.jwtSecret;
		this.app = express();
		this.createConsole( cfg.consolePort, cfg.tcpLoggerPort );
	}
	
	private createConsole( port: number, tcp: number ) {
		this.app.use( express.static( resolve( __dirname, ".." ) ) );
		this.app.use( bodyParser.json() );
		this.app.use( bodyParser.urlencoded( { extended: false } ) );
		
		/* 创建接口 */
		this.useApi( "/api/check", CheckRouter, false );
		this.useApi( "/api/login", LoginRouter, false );
		this.useApi( "/api/log", LogRouter );
		this.useApi( "/api/user", UserRouter );
		this.useApi( "/api/stat", StatRouter );
		
		/* 捕获错误 */
		this.app.use( WebConsole.ApiErrorCatch );
		
		useWebsocket( this.app );
		createServer( socket => {
			let messageCache: string = "";
			socket.setEncoding( "utf-8" );
			socket.on( "data", res => {
				messageCache += res;
			} );
			
			// @ts-ignore
			this.app.ws( "/ws/log", ( ws, req ) => {
				messageCache = "";
				const cron: string = "*/2 * * * * ?";
				const job = scheduleJob( cron, () => {
					if ( messageCache.length !== 0 ) {
						const data = messageCache.split( "__ADACHI__" )
							.filter( el => el.length !== 0 )
							.map( el => JSON.parse( el ) );
						ws.send( JSON.stringify( data ) );
						messageCache = "";
					}
				} );
				ws.on( "close", () => job.cancel() && ws.close() );
			} );
			if ( this.isFirstListen ) {
				this.isFirstListen = false;
				this.app.listen( port, () => {
					console.log( `网页控制台已启动，请浏览器打开 http://127.0.0.1:${ port } 查看，若为云服务器，请将 127.0.0.1 替换为服务器的公网ip。` )
				} );
			}
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
				const auth = req.headers.authorization;
				if ( auth && auth.split( " " )[0] === "Bearer" ) {
					return auth.split( " " )[1]
				} else if ( req.query && req.query.token ) {
					return req.query.token;
				}
				return null;
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