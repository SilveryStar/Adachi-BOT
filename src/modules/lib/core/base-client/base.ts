import WebSocket, { RawData } from "ws";
import { isJsonString } from "@/utils/verify";
import {
	ActionRequest,
	ActionResponse,
	EventData,
	FriendInfo,
	GroupInfo, GroupMessageEvent, GroupUploadNoticeEvent, OfflineFileNoticeEvent,
	OneBotVersionInfo, PrivateMessageEvent,
	Sendable, SexType, toCqCode,
	toMessageRecepElem
} from "@/modules/lib";
import { getLogger, Logger } from "log4js";
import EventEmitter from "@/modules/lib/core/event-emitter";
import { ApiMap } from "@/modules/lib/types/map/api";
import { formatSendMessage } from "@/modules/lib/message";
import { getRandomString } from "@/utils/random";
import message from "@/web-console/backend/routes/message";

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
	
	/**
	 * 通常情况下不能直接通过 messageEvent 获取到上传的文件消息
	 * 不同实现端对此有不同的处理
	 * go-cqhttp: 私聊触发 notice.offline_file 事件、群聊触发 notice.group_upload 事件
	 * Lagrange.core: 同 go-cqhttp，但会同时分别触发 private_message 和 group_message，不过此次触发中 message 字段为空数组，仅包含 message_id 等其他信息
	 *
	 * 对此，此方法旨在组合 Lagrange.core 中两次出发的数据，毕竟诸如牵扯到撤回、回复的 message_id 字段等，是 notice.offline_file、notice.group_upload 事件主体中不存在的
	 * 而对于 go-cqhttp 这种未携带消息字段的情况，此方法也会自行组装，以最大限度的还原消息数据
	 *
	 * Lagrange.core 的两次触发的 time 字段完全相同，目前基于这种方式组装数据
	 */
	private msgEventCache = new Map<string, {
		timer: NodeJS.Timeout,
		msgEvent: PrivateMessageEvent | GroupMessageEvent | null,
		uploadEvent: OfflineFileNoticeEvent | GroupUploadNoticeEvent | null
	}>();
	
	// 组合数据
	private processCombinedData( data: PrivateMessageEvent | GroupMessageEvent | OfflineFileNoticeEvent | GroupUploadNoticeEvent ) {
		const key = `${ data.user_id }_${ data.time }`;
		const cache = this.msgEventCache.get( key );
		const delay = 2000;
		
		if ( cache ) {
			clearTimeout( cache.timer );
			let msgData: PrivateMessageEvent | GroupMessageEvent;
			if ( data.post_type === "notice" ) {
				if ( !cache.msgEvent ) return;
				msgData = this.combinedFileData( cache.msgEvent, data );
			} else {
				if ( !cache.uploadEvent ) return;
				msgData = this.combinedFileData( data, cache.uploadEvent );
			}
			this.processWsMessageEvent( <EventData>msgData );
			this.msgEventCache.delete( key );
		} else {
			if ( data.post_type === "notice" ) {
				// 先传进来了 upload 消息数据，存放到 cache，等待后续 message 数据到了后组合
				// 若超时后 message 数据未到达，则自行生成一个默认的 message 数据
				const timer = setTimeout( () => {
					const defaultMsgEvent = this.getMsgEventByUploadEvent( data );
					this.processCombinedData( defaultMsgEvent );
				}, delay );
				this.msgEventCache.set( key, { msgEvent: null, uploadEvent: data, timer } );
			} else {
				// 先传进来了 message 消息数据，存放到 cache，等待后续 upload 数据到了后组合
				// 若超时后 upload 数据未到达，直接取消本次数据合成，因为没有 file 则无意义
				const timer = setTimeout( () => {
					this.msgEventCache.delete( key );
				}, delay );
				this.msgEventCache.set( key, { msgEvent: data, uploadEvent: null, timer } );
			}
		}
	}
	
	/* 组装 file 和 msg 消息数据 */
	private combinedFileData( msgEvent: PrivateMessageEvent | GroupMessageEvent, fileEvent: OfflineFileNoticeEvent | GroupUploadNoticeEvent ): GroupMessageEvent | PrivateMessageEvent {
		return {
			...msgEvent,
			message: [ {
				type: "file",
				data: {
					name: fileEvent.file.name,
					size: fileEvent.file.size,
					url: fileEvent.file.url || fileEvent.file.name
				}
			} ],
		}
	}
	
	// 根据 notice.offline_file 和 notice.group_upload 事件生成默认的 message.private 和 message.group 的数据格式
	private getMsgEventByUploadEvent( data: OfflineFileNoticeEvent | GroupUploadNoticeEvent ): PrivateMessageEvent | GroupMessageEvent {
		if ( data.notice_type === "offline_file" ) {
			return {
				post_type: "message",
				message_type: "private",
				sub_type: "friend",
				message_id: 0,
				user_id: data.user_id,
				message: [],
				raw_message: "",
				font: 0,
				sender: {
					user_id: data.user_id,
					nickname: "",
					sex: "unknown",
					age: 0
				},
				self_id: data.self_id || this.uin,
				time: data.time,
				atMe: false,
				reply( content: Sendable ): Promise<ActionResponse<void>> {
					return Promise.resolve( { retcode: 0, status: "ok", data: null, msg: "success" } );
				}
			}
		} else {
			return {
				post_type: "message",
				message_type: "group",
				sub_type: "normal",
				message_id: 0,
				group_id: data.group_id,
				user_id: data.user_id,
				message: [],
				raw_message: "",
				font: 0,
				sender: {
					user_id: data.user_id,
					nickname: "",
					sex: "unknown",
					age: 0,
					card: "",
					area: "",
					level: "",
					role: "member",
					title: ""
				},
				anonymous: null,
				self_id: data.self_id || this.uin,
				time: data.time,
				atMe: false,
				reply( content: Sendable ): Promise<ActionResponse<void>> {
					return Promise.resolve( { retcode: 0, status: "ok", data: null, msg: "success" } );
				},
				recall(): Promise<ActionResponse<void>> {
					return Promise.resolve( { retcode: 0, status: "ok", data: null, msg: "success" } );
				},
				kick(): Promise<ActionResponse<void>> {
					return Promise.resolve( { retcode: 0, status: "ok", data: null, msg: "success" } );
				},
				ban(): Promise<ActionResponse<void>> {
					return Promise.resolve( { retcode: 0, status: "ok", data: null, msg: "success" } );
				}
			}
		}
	}
	
	private processWsMessageEvent( data: EventData ) {
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
			/* 空消息，丢去等上传消息数据组合 */
			if ( data.message.length === 0 ) {
				this.processCombinedData( data );
				return;
			}
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
						// 好友私聊
						this.logger.info( `[Private: bot <= ${ data.sender.user_id }] ${ data.sender.nickname }: ${ data.raw_message }` );
						this.emitter.emit( "message.private.friend", data );
						break;
					case "group":
						// 临时会话
						const groupInfo = this.gl.get( data.sender.group_id );
						const groupName = groupInfo ? groupInfo.group_name : "";
						this.logger.info( `[Private: bot <= ${ data.sender.group_id }, ${ data.sender.user_id }] ${ groupName }(${ data.sender.nickname }): ${ data.raw_message }` );
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
					// 普通群消息
					case "normal":
						this.logger.info( `[Group: bot <= ${ data.group_id }, ${ data.sender.user_id }]] ${ groupName }(${ data.sender.card || data.sender.nickname }): ${ data.raw_message }` );
						this.emitter.emit( "message.group.normal", data );
						break;
					// 群匿名消息
					case "anonymous":
						this.logger.info( `[Group: bot <= ${ data.group_id }, anonymous]] ${ groupName }(${ data.anonymous.name }): ${ data.raw_message }` );
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
					/* ob11 未定义的离线文件事件 */
					case "offline_file":
						// 上传文件消息，丢去等 message 消息数据组合
						this.processCombinedData( data );
						this.emitter.emit( "notice.friend.offline_file", data );
				}
				this.emitter.emit( "notice.friend", data );
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
						// 上传文件消息，丢去等 message 消息数据组合
						this.processCombinedData( data );
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
			this.processWsMessageEvent( data );
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
			tipTarget = params.message_type === "group" ? `[Group: bot => ${ params.group_id }]` : `[Private: bot => ${ params.user_id }]`;
		}
		if ( action === "send_private_msg" ) {
			tipTarget = `[Private: bot => ${ params.user_id }]`;
		}
		if ( action === "send_group_msg" ) {
			tipTarget = `[Group: bot => ${ params.group_id }]`;
		}
		if ( !tipTarget ) {
			return;
		}
		const tipMessage = this.getMessageLogger( params.message );
		this.logger.info( `${ tipTarget }: ${ tipMessage }` );
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