import WebSocket from "ws";
import { isJsonString } from "@/utils/verify";
import {
	ActionRequest,
	ActionResponse,
	EventData,
	FriendInfo,
	GroupInfo,
	OneBotVersionInfo,
	Sendable, toCqCode,
	toMessageRecepElem
} from "@/modules/lib";
import { getLogger, Logger } from "log4js";
import EventEmitter from "@/modules/lib/core/event-emitter";
import { ApiMap } from "@/modules/lib/types/map/api";
import { formatSendMessage } from "@/modules/lib/message";
import { getRandomString } from "@/utils/random";

type ApiParam<T extends ( param: any ) => any> = T extends () => any
	? undefined
	: T extends ( param: infer P ) => any
		? P
		: never;

export default abstract class BaseClient {
	protected eventOnline = false;
	protected apiOnline = false;
	public emitter = EventEmitter.getInstance();
	
	public gl: Map<number, GroupInfo> = new Map();
	public fl: Map<number, FriendInfo> = new Map();
	
	public uin: number = 0;
	public online: boolean = false;
	public oneBotVersion: OneBotVersionInfo | null = null;
	public logger: Logger = getLogger( "[adachi]" );
	
	/**
	 * 手动轮询 bot 登陆状态
	 * 仅实现端未提供心跳包时启用
	 */
	protected heartTimer: NodeJS.Timer | null = null;
	
	protected constructor(
		protected fetchTimeout: number
	) {
	}
	
	/* 设置请求协议端的超时时间 */
	public setFetchTimeout( fetchTimeout: number ) {
		this.fetchTimeout = fetchTimeout;
	}
	
	protected initApiWs( this: BaseClient, ws: WebSocket ) {
		ws.on( "open", () => {
			this.apiOnline = true;
		} );
		ws.on( "message", ( res ) => {
			const resp = ( <Buffer>res ).toString();
			let data: ActionResponse;
			if ( !isJsonString( resp ) ) {
				return;
			}
			data = JSON.parse( resp );
			// 此时为 webhook 回执，过
			if ( !data.echo ) {
				return;
			}
			if ( data.retcode === 1 ) {
				return;
			}
			this.emitter.emitApi( data.echo, data );
		} );
		ws.on( "close", () => {
			if ( this.apiOnline ) {
				this.apiOnline = false;
				this.logger.warn( "与 api 事件服务器的连接中断，正在尝试重连..." );
			}
		} );
	}
	
	/* 检查是否在线 */
	protected async checkOnline() {
		try {
			const data = await this.fetchApi( "get_status", undefined, false );
			return data.retcode === 0 ? !!( data.data.good || data.data.online ) : null;
		} catch {
			return null;
		}
	}
	
	/* 初始化版本信息 */
	protected async getVersionInfo() {
		try {
			const data = await this.fetchApi( "get_version_info", undefined );
			this.oneBotVersion = data.retcode === 0 ? data.data : null;
		} catch {
		}
	}
	
	/* 初始化群组列表 */
	public async setGroupList() {
		try {
			const data = await this.fetchApi( "get_group_list", undefined );
			this.gl = data.retcode === 0 ? new Map( data.data.map( d => [ d.group_id, d ] ) ) : new Map();
		} catch {
		}
	}
	
	/* 初始化好友列表 */
	public async setFriendList() {
		try {
			const data = await this.fetchApi( "get_friend_list", undefined );
			this.fl = data.retcode === 0 ? new Map( data.data.map( d => [ d.user_id, d ] ) ) : new Map();
		} catch {
		}
	}
	
	/* 账号登录状态变更 */
	protected botStateChange( online: boolean ) {
		if ( online === this.online ) {
			return;
		}
		this.online = online;
		if ( this.online ) {
			Promise.all( [ this.getVersionInfo(), this.setGroupList(), this.setFriendList() ] ).then();
			this.emitter.emit( "system.online" );
		} else {
			this.emitter.emit( "system.offline" );
		}
	}
	
	/* 关闭登陆状态轮询 */
	protected closeHeartTimer() {
		if ( !this.heartTimer ) return;
		clearInterval( this.heartTimer );
		this.heartTimer = null;
	}
	
	protected initEventWs( this: BaseClient, ws: WebSocket ) {
		ws.on( "open", () => {
			this.eventOnline = true;
		} );
		ws.on( "message", ( res ) => {
			const resp = ( <Buffer>res ).toString();
			let data: EventData;
			if ( !isJsonString( resp ) ) {
				return;
			}
			data = JSON.parse( resp );
			// 此时为 api 回执，过
			if ( Reflect.has( data, "echo" ) ) {
				return;
			}
			
			const quickOperation = ( params: Record<string, any> ) => {
				return this.fetchApi( <any>".handle_quick_operation", {
					context: data,
					operation: params
				} );
			};
			if ( data.post_type === "meta_event" ) {
				if ( data.meta_event_type === "lifecycle" ) {
					if ( data.sub_type === "connect" && !this.online ) {
						/* 默认连接后开启 bot 状态轮询 */
						const heartHandle = async () => {
							const online = await this.checkOnline();
							if ( online === null ) return;
							this.botStateChange( online );
						}
						heartHandle().then();
						this.heartTimer = setInterval( heartHandle, 10000 );
					}
					this.emitter.emit( "system.lifecycle", data );
				}
				if ( data.meta_event_type === "heartbeat" ) {
					/* 接受到实现端心跳事件时，移除 bot 状态轮询 */
					this.closeHeartTimer();
					/* 个别实现端仅会设置其中一个为 true */
					this.botStateChange( data.status.online || data.status.good );
				}
				this.emitter.emit( "system", data );
			}
			
			if ( data.post_type === "message" ) {
				/* 若消息格式为 string，手动格式化为 json */
				const message: any = data.message;
				if ( typeof message === "string" ) {
					data.message = toMessageRecepElem( message );
				}
				data.raw_message = toCqCode( data.message );
				/* 是否为 at bot */
				const atMeEl = data.message.find( el => {
					return el.type === "at" && Number.parseInt( el.data.qq ) === this.uin;
				} )
				data.atMe = !!atMeEl;
				
				if ( data.message_type === "private" ) {
					data.reply = ( content: Sendable ) => quickOperation( { reply: formatSendMessage( content ) } );
					switch ( data.sub_type ) {
						case "friend":
							this.logger.info( `来自好友 ${ data.sender.nickname }(${ data.sender.user_id }) 的私聊消息: ${ data.raw_message }` );
							this.emitter.emit( "message.private.friend", data );
							break;
						case "group":
							const groupInfo = this.gl.get( data.sender.group_id );
							const groupName = groupInfo ? groupInfo.group_name : "";
							this.logger.info( `来自群 ${ groupName }(${ data.sender.group_id }) 内 ${ data.sender.nickname }(${ data.sender.user_id }) 的临时会话消息: ${ data.raw_message }` );
							this.emitter.emit( "message.private.group", data );
							break;
					}
					this.emitter.emit( "message.private", data );
				}
				if ( data.message_type === "group" ) {
					const groupInfo = this.gl.get( data.group_id );
					const groupName = groupInfo ? groupInfo.group_name : "";
					data.reply = ( content: Sendable, at = true ) => quickOperation( {
						reply: formatSendMessage( content ),
						at_sender: at
					} );
					data.recall = () => quickOperation( { delete: true } );
					data.kick = () => quickOperation( { kick: true } );
					data.ban = ( duration ) => quickOperation( { ban: true, ban_duration: duration } );
					switch ( data.sub_type ) {
						case "normal":
							this.logger.info( `来自群 ${ groupName }(${ data.group_id }) 内 ${ data.sender.card || data.sender.nickname }(${ data.sender.user_id }) 的消息: ${ data.raw_message }` );
							this.emitter.emit( "message.group.normal", data );
							break;
						case "anonymous":
							this.logger.info( `来自群 ${ groupName }(${ data.group_id }) 内 ${ data.anonymous.name } 的匿名消息: ${ data.raw_message }` );
							this.emitter.emit( "message.group.anonymous", data );
					}
					this.emitter.emit( "message.group", data );
				}
				this.emitter.emit( "message", data );
			}
			
			if ( data.post_type === "notice" ) {
				if ( this.emitter.checkNoticePrivateEvent( data ) ) {
					switch ( data.notice_type ) {
						case "friend_add":
							this.setFriendList().then();
							this.logger.info( `更新好友列表：新增好友 ${ data.user_id }` );
							this.emitter.emit( "notice.friend.add", data );
							break;
						case "friend_recall":
							this.emitter.emit( "notice.friend.recall", data );
							break;
					}
				} else {
					switch ( data.notice_type ) {
						case "group_recall":
							this.emitter.emit( "notice.group.recall", data );
							break;
						case "group_increase":
							this.emitter.emit( "notice.group.increase", data );
							if ( data.user_id === this.uin ) {
								this.setGroupList().then();
								this.logger.info( `更新群列表：新增群聊 ${ data.group_id }` );
								this.emitter.emit( "notice.group.increase", data );
							} else {
								this.emitter.emit( "notice.group.member_increase", data );
							}
							break;
						case "group_decrease":
							if ( data.sub_type === "kick_me" || data.user_id === this.uin ) {
								this.setGroupList().then();
								this.logger.info( `更新群列表：移除群聊 ${ data.group_id }` );
								this.emitter.emit( "notice.group.decrease", data );
							} else {
								this.emitter.emit( "notice.group.member_decrease", data );
							}
							break;
						case "group_admin":
							this.emitter.emit( "notice.group.admin", data );
							break;
						case "group_upload":
							this.logger.info( `来自群 ${ data.group_id } 内 ${ data.user_id } 上传的文件: ${ data.file.name }` );
							this.emitter.emit( "notice.group.upload", data );
							break;
						case "group_ban":
							this.emitter.emit( "notice.group.ban", data );
							break;
						case "notify":
							if ( data.sub_type === "lucky_king" ) {
								this.emitter.emit( "notice.group.lucky_king", data );
							}
							if ( data.sub_type === "honor" ) {
								this.emitter.emit( "notice.group.honor", data );
							}
							if ( ( <any>data ).sub_type === "poke" ) {
								this.emitter.emit( "notice.group.poke", <any>data );
							}
							break;
					}
					this.emitter.emit( "notice.group", data );
				}
				this.emitter.emit( "notice", data );
			}
			
			if ( data.post_type === "request" ) {
				switch ( data.request_type ) {
					case "friend":
						data.approve = ( approve, remark ) => quickOperation( { approve, remark } );
						this.logger.info( `来自 (${ data.user_id }) 的添加好友请求` );
						this.emitter.emit( "request.friend", data );
						break;
					case "group":
						data.approve = ( approve, reason ) => quickOperation( { approve, reason } );
						this.logger.info( `来自群 ${ data.group_id } 内 (${ data.user_id }) 的入群请求` );
						this.emitter.emit( "request.group", data );
						break;
				}
				this.emitter.emit( "request", data );
			}
		} );
		ws.on( "close", () => {
			if ( this.online ) {
				this.online = false;
				/* 连接关闭时关闭 bot 状态轮询 */
				this.closeHeartTimer();
				this.emitter.emit( "system.offline" );
			}
			if ( this.eventOnline ) {
				this.eventOnline = false;
				this.logger.warn( "与 event 事件服务器的连接中断，正在尝试重连..." );
			}
		} )
	}
	
	/**
	 * 请求 api
	 * @param action 事件名称
	 * @param params 事件参数
	 * @param checkOnline 调用此 api 是否需要登录
	 */
	public fetchApi<T extends keyof ApiMap>( action: T, params: ApiParam<ApiMap[T]>, checkOnline = true ): Promise<ActionResponse<ReturnType<ApiMap[T]>>> {
		const echo = Date.now().toString( 36 ) + getRandomString( 6 );
		const getErrorResponse = ( msg: string, wording: string ): ActionResponse => ( {
			retcode: 401,
			status: "failed",
			data: null,
			msg,
			wording,
			echo
		} )
		if ( !this.eventOnline ) {
			return Promise.resolve( getErrorResponse( "Event_Offline", "未能连接到 event 事件服务器" ) );
		}
		if ( !this.apiOnline ) {
			return Promise.resolve( getErrorResponse( "Api_Offline", "未能连接到 api 事件服务器" ) );
		}
		if ( checkOnline && !this.online ) {
			return Promise.resolve( getErrorResponse( "Not_Login", "未登录" ) );
		}
		
		this.printSendLogger( action, params );
		this.sendMessage( { action, params: params || {}, echo } );
		/* 10000ms 超时 */
		const timer = setTimeout( () => {
			this.emitter.emitApi( echo, {
				retcode: 408,
				status: "failed",
				data: null,
				msg: `Action ${ action } Request_Timeout`,
				wording: `Api ${ action } 请求超时`,
				echo
			} )
		}, this.fetchTimeout );
		return new Promise( resolve => {
			this.emitter.onApi( echo, data => {
				clearTimeout( timer );
				resolve( data );
			} );
		} )
	}
	
	/* 根据 message 类型获取日志打印内容 */
	protected getMessageLogger( message: any ) {
		if ( typeof message === "string" ) {
			return message;
		}
		if ( message instanceof Array ) {
			return message.map( msg => {
				return this.getMessageLogger( msg );
			} ).join( "" );
		}
		
		const { type, data } = message;
		if ( type === "text" ) {
			return data.text;
		}
		const msgMap = {
			at: data.qq,
			music: data.id || data.url,
			reply: data.id || data.qq,
			face: data.id,
			share: data.url,
			poke: data.qq,
			gift: data.id,
			image: "[图片]",
			record: "[语音]",
			video: "[视频]",
			node: "[转发消息]"
		}
		const tipMsg = msgMap[type] || "";
		if ( tipMsg ) {
			return `{${ type }: ${ tipMsg }}`;
		}
		return `{${ type }}`;
	}
	
	/* 打印消息发送日志 */
	protected printSendLogger( action: string, params: any = {} ) {
		let tipTarget = "";
		if ( action === "send_msg" ) {
			tipTarget = params.message_type === "group" ? `[群聊(${ params.group_id })]` : `[私聊(${ params.user_id })]`;
		}
		if ( action === "send_private_msg" ) {
			tipTarget = `[私聊(${ params.user_id })]`;
		}
		if ( action === "send_group_msg" ) {
			tipTarget = `[群聊(${ params.group_id })]`;
		}
		if ( !tipTarget ) {
			return;
		}
		const tipMessage = this.getMessageLogger( params.message );
		this.logger.info( `消息发送成功: ${ tipTarget } ${ tipMessage }` );
	}
	
	public abstract setTarget( eventTarget: string, apiTarget: string, wsPort: number ): void
	
	public abstract sendMessage( data: ActionRequest ): void
	
	public abstract connect(): Promise<void>
	
	public abstract closeConnect(): Promise<void>
	
	public async reConnect() {
		await this.closeConnect();
		await this.connect();
	}
}