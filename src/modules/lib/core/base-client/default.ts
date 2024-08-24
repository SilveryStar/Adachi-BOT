import BaseClient from "./base";
import WsMessage from "@/utils/message";
import WebSocket from "ws";
import { ActionRequest } from "@/modules/lib";
import { parseURL } from "@/utils/url";

export default class DefaultClient extends BaseClient {
	private static __instance: DefaultClient;
	private readonly wsApi: WsMessage;
	private readonly wsEvent: WsMessage;
	
	constructor(
		private eventTarget: string,
		private apiTarget: string,
		fetchTimeout: number
	) {
		super( fetchTimeout );
		if ( this.needApiConnect ) {
			this.wsEvent = new WsMessage( this.initEventWs.bind( this ), false );
			this.wsApi = new WsMessage( this.initApiWs.bind( this ), false );
		} else {
			this.wsEvent = this.wsApi = new WsMessage( ws => {
				this.initEventWs( ws );
				this.initApiWs( ws );
			}, false );
		}
	}
	
	private initWsEvent( type: "all" | "event" | "api" ) {
		return ( ws: WebSocket ) => {
			if ( type === "all" || type === "event" ) {
				this.initEventWs( ws );
				ws.on( "open", () => {
					this.logger.info( `已连接到 event 事件服务器：${ this.eventTarget }` );
				} );
			}
			if ( type === "all" || type === "api" ) {
				this.initApiWs( ws );
				ws.on( "open", () => {
					this.logger.info( `已连接到 api 事件服务器：${ this.apiTarget || this.eventTarget }` );
				} )
			}
		}
	}
	
	public static getInstance( eventTarget?: string, apiTarget?: string, fetchTimeout?: number ) {
		if ( !DefaultClient.__instance ) {
			if ( !eventTarget || typeof apiTarget === "undefined" || !fetchTimeout ) {
				throw new Error( "Invalid parameter" );
			}
			DefaultClient.__instance = new DefaultClient( eventTarget, apiTarget, fetchTimeout );
		}
		return DefaultClient.__instance;
	}
	
	// 是否需要为 api 创建第二个 websocket 链接
	private get needApiConnect() {
		return this.apiTarget && this.apiTarget !== this.eventTarget;
	}
	
	public setTarget( eventTarget: string, apiTarget: string, wsPort: number ) {
		this.eventTarget = eventTarget;
		this.apiTarget = apiTarget;
	}
	
	public sendMessage( data: ActionRequest ) {
		this.wsApi.sendMessage( data );
	}
	
	public async connect(): Promise<void> {
		let wsProtocol = "ws:";
		if ( parseURL( this.eventTarget ).port === "443" ) {
			wsProtocol = "wss:";
		}
		this.wsEvent.connect( `${ wsProtocol }//${ this.eventTarget }` );
		/* 监听连接成功状态 */
		return new Promise( resolve => {
			// 事件服务器连接状态
			let connectStatus = false;
			const checkResolve = () => {
				if ( !this.needApiConnect || connectStatus ) {
					resolve();
				} else {
					connectStatus = true;
				}
			}
			this.wsEvent.ws?.on( "open", () => {
				this.logger.info( `已连接到 event 事件服务器：${ this.eventTarget }` );
				if ( !this.needApiConnect ) {
					this.logger.info( `已连接到 api 事件服务器：${ this.apiTarget || this.eventTarget }` );
				}
				checkResolve();
			} );
			if ( this.needApiConnect ) {
				this.wsApi.connect( `ws://${ this.apiTarget }` );
				this.wsApi.ws?.on( "open", () => {
					this.logger.info( `已连接到 api 事件服务器：${ this.apiTarget || this.eventTarget }` );
					checkResolve();
				} );
			}
		} );
	}
	
	public async closeConnect() {
		this.wsEvent.closeConnect();
		if ( this.needApiConnect ) {
			this.wsApi.closeConnect();
		}
	}
}