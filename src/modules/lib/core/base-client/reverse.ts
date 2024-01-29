import BaseClient from "./base";
import { WsServerMessage } from "@/utils/message";
import WebSocket from "ws";
import { ActionRequest } from "@/modules/lib";

export default class ReverseClient extends BaseClient {
	private static __instance: ReverseClient;
	private wsClient: WsServerMessage;
	
	constructor(
		private wsPort: number,
		fetchTimeout: number
	) {
		super( fetchTimeout );
		this.wsClient = new WsServerMessage( ws => {
			this.initEventWs( ws );
			this.initApiWs( ws );
		}, false );
	}
	
	public static getInstance( wsPort?: number, fetchTimeout?: number ) {
		if ( !ReverseClient.__instance ) {
			if ( typeof wsPort === "undefined" || !fetchTimeout ) {
				throw new Error( "Invalid parameter" );
			}
			ReverseClient.__instance = new ReverseClient( wsPort, fetchTimeout );
		}
		return ReverseClient.__instance;
	}
	
	public setTarget( _: string, __: string, wsPort: number ) {
		this.wsPort = wsPort;
	}
	
	public sendMessage( data: ActionRequest ) {
		this.wsClient.sendMessage( data );
	}
	
	public async connect(): Promise<void> {
		const wss = await this.wsClient.createServer( this.wsPort );
		this.logger.info( `开启ws服务器成功，监听地址: ws://127.0.0.1:${ this.wsPort }` );
		
		wss.on( "close", () => {
			if ( this.online ) {
				this.online = false;
				/* 连接关闭时关闭 bot 状态轮询 */
				this.closeHeartTimer();
				this.emitter.emit( "system.offline" );
			}
			if ( this.eventOnline || this.apiOnline ) {
				this.eventOnline = this.apiOnline = false;
				this.logger.warn( "与 api 事件服务器的连接中断" );
			}
		}  );
		
		return new Promise( resolve => {
			wss.on( "connection", ( _, req ) => {
				this.eventOnline = this.apiOnline = true;
				this.logger.info( `已接收到到事件服务器的连接：127.0.0.1:${ this.wsPort }(${ req.url })` );
				resolve();
			} );
		} )
	}
	
	public async closeConnect() {
		this.wsClient.closeConnect();
		await this.wsClient.closeClient();
	}
}