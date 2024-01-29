import WebSocket from "ws";
import http from "http";

class WsMessageBase {
	public ws: WebSocket | null = null;
	protected taskTimer: NodeJS.Timer | null = null;
	protected timeout: NodeJS.Timer | null = null;
	protected closeForce = false;
	
	// 发送消息
	public sendMessage( message: any ) {
		if ( this.isOpen( this.ws ) ) {
			message = typeof message === "string" ? message : JSON.stringify( message );
			this.ws.send( message );
		}
	}
	
	public closeConnect() {
		this.closeForce = true;
		// 关闭心跳
		this.closeTimers( [ this.taskTimer, this.timeout ] );
		this.ws?.close();
		this.closeForce = false;
	}
	
	public isOpen( ws: WebSocket | null = this.ws ): ws is WebSocket {
		return ws?.readyState === WebSocket.OPEN;
	}
	
	protected closeTimers( timers: NodeJS.Timer | null | Array<NodeJS.Timer | null> ) {
		if ( !( timers instanceof Array ) ) {
			timers = [ timers ];
		}
		timers.forEach( timer => {
			if ( !timer ) return;
			clearInterval( timer );
			clearTimeout( timer );
			timer = null;
		} );
	}
}

export class WsServerMessage extends WsMessageBase {
	private wss: WebSocket.Server | null = null;
	private server: http.Server | null = null;
	constructor(
		private initEvent: ( ws: WebSocket ) => void,
		private heartbeat = true
	) {
		super();
	}
	
	public createServer( port: number ): Promise<WebSocket.Server> {
		return new Promise( resolve => {
			this.server = http.createServer( ( req, res ) => {
				res.writeHead( 200, { 'Content-Type': 'text/plain' } );
				res.end( 'WebSocket Server is running' );
			} )
			this.wss = new WebSocket.Server({ server: this.server });
			this.taskTimer && clearInterval( <any>this.taskTimer );
			this.wss.on( "connection", ws => {
				this.ws = ws;
				this.initWsEvent( ws );
				if ( !this.heartbeat ) {
					return;
				}
				this.taskTimer = setInterval( () => {
					this.sendMessage( "ping" );
				}, 10000 );
			} )
			this.server.listen( port, () => {
				resolve( this.wss! );
			} );
		} );
	}
	
	public closeClient(): Promise<void> {
		return new Promise( resolve => {
			const wssClose: Promise<void> = new Promise( res => {
				if ( !this.wss ) {
					return res();
				}
				this.wss.close( () => {
					res();
				} );
			} );
			wssClose.then( () => {
				if ( !this.server ) {
					return resolve();
				}
				this.server.close( () => {
					resolve();
				} );
			} )
		} );
	}
	
	private initWsEvent( ws: WebSocket ) {
		ws.on( "error", () => {} );
		ws.on( "close", () => {
			this.closeConnect();
		} );
		this.initEvent( ws );
	}
}

export default class WsMessage extends WsMessageBase {
	private target: string = "";
	private retryTime: number = 0;
	
	constructor(
		private initEvent: ( ws: WebSocket ) => void,
		private heartbeat: boolean = true
	) {
		super();
	}
	
	public connect( target: string ) {
		if ( this.isOpen( this.ws ) ) {
			return;
		}
		this.taskTimer && clearInterval( this.taskTimer );
		this.target = target;
		this.ws = new WebSocket( target );
		this.initWsEvent();
	}
	
	private initWsEvent() {
		if ( !this.ws ) return;
		this.ws.on( "open", () => {
			this.retryTime = 0;
			if ( !this.heartbeat ) {
				return;
			}
			this.taskTimer = setInterval( () => {
				this.sendMessage( "ping" );
			}, 10000 );
		} )
		// 连接错误
		this.ws.on( "error", () => {} );
		this.ws.on( "close", () => {
			if ( !this.closeForce ) {
				// 重连
				this.reconnect();
			}
		} );
		this.initEvent( this.ws );
	}
	
	public reconnect() {
		this.closeTimers( this.timeout );
		const waitTime: number = this.retryTime > 20
			? 60000
			: this.retryTime > 10
				? 20000
				: 5000;
		this.timeout = setTimeout( () => {
			// 重新连接WebSocket
			this.connect( this.target );
		}, waitTime );
	}
}