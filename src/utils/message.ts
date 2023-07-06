import WebSocket from "ws";

export default class WsMessage {
	public ws: WebSocket | null = null;
	private taskTimer: NodeJS.Timer | null = null;
	private timeout: NodeJS.Timer | null = null;
	private target: string = "";
	private retryTime: number = 0;
	
	constructor(
		private initEvent: ( ws: WebSocket ) => void,
		private heartbeat: boolean = true
	) {
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
			if ( this.heartbeat ) {
				this.taskTimer = setInterval( () => {
					if ( this.ws?.readyState === WebSocket.OPEN ) {
						this.ws.send( "ping" );
					}
				}, 10000 );
			}
		} )
		// 连接错误
		this.ws.on( "error", () => {} );
		this.ws.on( "close", () => {
			// 重连
			this.reconnect();
		} );
		this.initEvent( this.ws );
	}
	
	// 发送消息
	public sendMessage( message: any ) {
		if ( this.isOpen( this.ws ) ) {
			message = typeof message === "string" ? message : JSON.stringify( message );
			this.ws.send( message );
		}
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
	
	public closeConnect() {
		// 关闭心跳
		this.closeTimers( [ this.taskTimer, this.timeout ] );
		this.ws?.close();
	}
	
	public isOpen( ws: WebSocket | null = this.ws ): ws is WebSocket {
		return ws?.readyState === WebSocket.OPEN;
	}
	
	private closeTimers( timers: NodeJS.Timer | null | Array<NodeJS.Timer | null> ) {
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