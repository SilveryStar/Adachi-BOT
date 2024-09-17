import BaseClient from "./core/base-client/base";
import DefaultClient from "./core/base-client/default";
import ReverseClient from "./core/base-client/reverse";
import { BotConfig } from "@/modules/config";
import CoreLogger from "./core/logger";
import { getLogger, Logger } from "log4js";
import { ActionRequest, ActionResponse } from "./types/action";
import { EventMap } from "./types/map/event";
import { Anonymous, HonorType, RecordFormat } from "@/modules/lib/types/common";
import { ForwardElem, Sendable } from "./types/element/send";
import { formatSendMessage, makeForwardMessage, toMessageRecepElem } from "@/modules/lib/message";
import { MessageRecepElem } from "@/modules/lib/types/element";

export type LogLevel = "trace" | "debug" | "info" | "warn" | "error" | "fatal" | "mark" | "off";

export class Client {
	private baseClient: BaseClient;
	
	constructor( private config: BotConfig ) {
		if ( !config.base.reverseClient && ( !config.base.wsServer || !config.base.wsApiServer || !config.base.wsPort ) ) {
		
		}
		this.baseClient = config.base.reverseClient
			? ReverseClient.getInstance( config.base.wsPort, config.base.apiTimeout )
			: DefaultClient.getInstance( config.base.wsServer, config.base.wsApiServer, config.base.apiTimeout )
		this.initLoggerConfig();
		this.logger.level = config.base.logLevel;
		this.initRefreshListener();
		this.on( "system.lifecycle", data => {
			if ( data.sub_type === "connect" && data.self_id !== this.uin ) {
				this.initLogger( data.self_id, config.base.logLevel )
				this.initLoggerConfig();
			}
		} );
	}
	
	get gl() {
		return this.baseClient.gl;
	}
	
	get fl() {
		return this.baseClient.fl;
	}
	
	get logger() {
		return this.baseClient.logger;
	}
	
	set logger( logger: Logger ) {
		this.baseClient.logger = logger;
	}
	
	get uin() {
		return this.baseClient.uin;
	}
	
	get oneBotVersion() {
		return this.baseClient.oneBotVersion;
	}
	
	private initLogger( uin: number, logLevel: string ) {
		this.baseClient.uin = uin;
		this.logger = getLogger( `[${ this.uin }]` );
		this.logger.level = logLevel;
	}
	
	private initLoggerConfig() {
		new CoreLogger(
			this.uin,
			this.config.base.logLevel,
			this.config.webConsole.tcpLoggerPort,
			this.config.webConsole.enable
		);
	}
	
	private initRefreshListener() {
		this.config.base.on( "refresh", ( newCfg, oldCfg ) => {
			if (
				newCfg.reverseClient !== oldCfg.reverseClient ||
				newCfg.wsServer !== oldCfg.wsServer ||
				newCfg.wsApiServer !== oldCfg.wsApiServer ||
				newCfg.wsPort !== oldCfg.wsPort
			) {
				this.baseClient.setTarget( newCfg.wsServer, newCfg.wsApiServer, newCfg.wsPort );
				if ( newCfg.reverseClient !== oldCfg.reverseClient ) {
					this.closeConnect().then( () => {
						this.baseClient = newCfg.reverseClient
							? ReverseClient.getInstance( newCfg.wsPort, newCfg.apiTimeout )
							: DefaultClient.getInstance( newCfg.wsServer, newCfg.wsApiServer, newCfg.apiTimeout )
						this.connect();
					} );
				} else {
					this.reConnect().then();
				}
			}
			if ( newCfg.apiTimeout !== oldCfg.apiTimeout ) {
				this.baseClient.setFetchTimeout( newCfg.apiTimeout );
			}
			if ( newCfg.logLevel !== oldCfg.logLevel ) {
				this.logger.level = newCfg.logLevel;
				this.initLoggerConfig();
			}
		} );
		this.config.webConsole.on( "refresh", ( newCfg, oldCfg ) => {
			if ( newCfg.enable !== oldCfg.enable || newCfg.tcpLoggerPort !== oldCfg.tcpLoggerPort ) {
				this.initLoggerConfig();
			}
		} );
	}
	
	private sendMessage( data: ActionRequest ) {
		this.baseClient.sendMessage( data );
	}
	
	public on<T extends keyof EventMap>( event: T, listener: EventMap[T] ) {
		this.baseClient.emitter.on( event, listener );
	}
	
	public once<T extends keyof EventMap>( event: T, listener: EventMap[T] ) {
		this.baseClient.emitter.once( event, listener );
	}
	
	public off<T extends keyof EventMap>( event: T, listener: EventMap[T] ) {
		this.baseClient.emitter.off( event, listener );
	}
	
	public async connect() {
		await this.baseClient.connect();
	}
	
	public closeConnect() {
		return this.baseClient.closeConnect();
	}
	
	public reConnect() {
		return this.baseClient.reConnect();
	}
	
	/** 自行请求 onebot api */
	public fetchOneBot( action: string, params: any ) {
		return this.baseClient.fetchApi( <any>action, params );
	}
	
	/** 重载群列表 */
	public async reloadGroupList() {
		return this.baseClient.setGroupList();
	}
	
	/** 重载好友列表 */
	public async reloadFriendList() {
		this.baseClient.setFriendList();
	}
	
	/** 点赞好友 */
	public async sendLike( user_id: number, time: number ) {
		return this.baseClient.fetchApi( "send_like", { user_id, time } );
	}
	
	/** 获取登录号信息 */
	public getLoginInfo() {
		return this.baseClient.fetchApi( "get_login_info", undefined )
	}
	
	private getApiResponse<T>( result: ActionResponse<any>, data: T ): ActionResponse<T> {
		return <any>{
			...result,
			data
		}
	}
	
	/** 获取陌生人信息 */
	public getStrangerInfo( user_id: number, no_cache = false ) {
		return this.baseClient.fetchApi( "get_stranger_info", { user_id, no_cache } );
	}
	
	/** 获取好友列表 */
	public getFriendList() {
		return this.baseClient.fetchApi( "get_friend_list", undefined );
	}
	
	/** 发送私聊消息 */
	public async sendPrivateMsg( user_id: number, message: Sendable ) {
		const result = await this.baseClient.fetchApi( "send_private_msg", {
			user_id,
			message: formatSendMessage( message )
		} );
		return this.getApiResponse( result, result.data?.message_id );
	}
	
	/** 发送群聊消息 */
	public async sendGroupMsg( group_id: number, message: Sendable ) {
		const result = await this.baseClient.fetchApi( "send_group_msg", {
			group_id,
			message: formatSendMessage( message )
		} );
		return this.getApiResponse( result, result.data?.message_id );
	}
	
	/** 发送消息 */
	public sendMsg( type: "private", user_id: number, message: Sendable ): Promise<ActionResponse<number>>;
	public sendMsg( type: "group", group_id: number, message: Sendable ): Promise<ActionResponse<number>>;
	public async sendMsg( type: "private" | "group", userOrGroupId: number, message: Sendable ) {
		const result = await this.baseClient.fetchApi( "send_msg", <any>{
			message_type: type,
			[type === "private" ? "user_id" : "group_id"]: userOrGroupId,
			message: formatSendMessage( message )
		} );
		return this.getApiResponse( result, result.data?.message_id );
	}
	
	/** 获取消息 */
	public async getMessage( message_id: number ) {
		const result = await this.baseClient.fetchApi( "get_msg", { message_id } );
		if ( result.data ) {
			const message = <MessageRecepElem[] | string>result.data.message;
			if ( typeof message === "string" ) {
				result.data.message = toMessageRecepElem( message );
			}
		}
		return result;
	}
	
	/** 撤回消息 */
	public recallMessage( message_id: number ) {
		return this.baseClient.fetchApi( "delete_msg", { message_id } );
	}
	
	/** 获取合并转发内容 */
	public async getForwardMessage( id: string ) {
		const result = await this.baseClient.fetchApi( "get_forward_msg", { id } );
		return this.getApiResponse( result, result.data && result.data.messages );
	}
	
	/** 获取图片信息 */
	public async getImage( file: string ) {
		const result = await this.baseClient.fetchApi( "get_image", { file } );
		return this.getApiResponse( result, result.data ? result.data.file : "" );
	}
	
	/** 检查是否可以发送图片 */
	public async canSendImage() {
		const result = await this.baseClient.fetchApi( "can_send_image", undefined );
		return this.getApiResponse( result, result.data && result.data.yes );
	}
	
	/** 获取语音 */
	public async getRecord( file: string, out_format: RecordFormat ) {
		const result = await this.baseClient.fetchApi( "get_record", { file, out_format } );
		return this.getApiResponse( result, result.data && result.data.file );
	}
	
	/** 是否能够发送语音 */
	public async canSendRecord() {
		const result = await this.baseClient.fetchApi( "can_send_record", undefined );
		return this.getApiResponse( result, result.data && result.data.yes );
	}
	
	/** 处理加好友请求 */
	public setFriendAddRequest( flag: string, approve?: boolean, remark?: string ) {
		return this.baseClient.fetchApi( "set_friend_add_request", { flag, approve, remark } );
	}
	
	/** 重启 OneBot 实现 */
	public setRestart( delay: number ) {
		return this.baseClient.fetchApi( "set_restart", { delay } );
	}
	
	/** 清理缓存 */
	public cleanCache() {
		return this.baseClient.fetchApi( "clean_cache", undefined );
	}
	
	/** 处理加群请求／邀请 */
	public setGroupAddRequest( flag: string, approve?: boolean, remark?: string ) {
		return this.baseClient.fetchApi( "set_group_add_request", {
			flag,
			sub_type: "add",
			approve,
			remark
		} );
	}
	
	/** 获取群信息 */
	public getGroupInfo( group_id: number, no_cache = false ) {
		return this.baseClient.fetchApi( "get_group_info", { group_id, no_cache } );
	}
	
	/** 获取群列表 */
	public getGroupList( no_cache = false ) {
		return this.baseClient.fetchApi( "get_group_list", undefined );
	}
	
	/** 获取群成员信息 */
	public async getGroupMemberInfo( group_id: number, user_id: number, no_cache = false ) {
		const data = await this.baseClient.fetchApi( "get_group_member_info", { group_id, user_id, no_cache } );
		if ( data.retcode !== 0 ) return data;
		if ( this.oneBotVersion?.app_name === "go-cqhttp" ) {
			data.data.is_shut_up = Date.now() / 1000 <= <number>data.data.shut_up_timestamp;
		}
		return data;
	}
	
	/** 获取群成员列表 */
	public getGroupMemberList( group_id: number ) {
		return this.baseClient.fetchApi( "get_group_member_list", { group_id } );
	}
	
	/** 获取群荣誉信息 */
	public getGroupHonorInfo( group_id: number, type: HonorType | "all" ) {
		return this.baseClient.fetchApi( "get_group_honor_info", { group_id, type } );
	}
	
	/** 获取 Cookies */
	public async getCookies( domain: string ) {
		const result = await this.baseClient.fetchApi( "get_cookies", { domain } );
		return this.getApiResponse( result, result.data ? result.data.cookies : "" );
	}
	
	/** 获取 CSRF Token */
	public async getCsrfToken() {
		const result = await this.baseClient.fetchApi( "get_csrf_token", undefined );
		return this.getApiResponse( result, result.data && result.data.token );
	}
	
	/** 获取客户端相关接口凭证 */
	public async getCredentials( domain: string ) {
		return this.baseClient.fetchApi( "get_credentials", { domain } );
	}
	
	/** 设置群名 */
	public setGroupName( group_id: number, group_name: string ) {
		return this.baseClient.fetchApi( "set_group_name", { group_id, group_name } );
	}
	
	/** 设置群管理员 */
	public setGroupAdmin( group_id: number, user_id: number, enable = true ) {
		return this.baseClient.fetchApi( "set_group_admin", { group_id, user_id, enable } );
	}
	
	/** 设置群名片 ( 群备注 ) */
	public setGroupCard( group_id: number, user_id: number, card?: string ) {
		return this.baseClient.fetchApi( "set_group_card", { group_id, user_id, card } );
	}
	
	/** 设置群组专属头衔 */
	public setGroupSpecialTitle( group_id: number, user_id: number, special_title?: string, duration = -1 ) {
		return this.baseClient.fetchApi( "set_group_special_title", {
			group_id,
			user_id,
			special_title,
			duration
		} );
	}
	
	/** 群单人禁言 */
	public setGroupBan( group_id: number, user_id: number, duration = 30 * 60 ) {
		return this.baseClient.fetchApi( "set_group_ban", { group_id, user_id, duration } );
	}
	
	/** 群全员禁言 */
	public setGroupWholeBan( group_id: number, enable = true ) {
		return this.baseClient.fetchApi( "set_group_whole_ban", { group_id, enable } );
	}
	
	/** 群匿名用户禁言 */
	public setGroupAnonymousBan( group_id: number, anonymous: Anonymous, duration: number ): Promise<ActionResponse<void>>;
	public setGroupAnonymousBan( group_id: number, flag: string, duration: number ): Promise<ActionResponse<void>>;
	public setGroupAnonymousBan( group_id: number, anonymousFlag: Anonymous | string, duration = 30 * 60 ) {
		return this.baseClient.fetchApi( "set_group_anonymous_ban", {
			group_id,
			[typeof anonymousFlag === "string" ? "flag" : "anonymous"]: anonymousFlag,
			duration
		} );
	}
	
	/** 群设置匿名 */
	public sendGroupAnonymous( group_id: number, enable = true ) {
		return this.baseClient.fetchApi( "set_group_anonymous", { group_id, enable } );
	}
	
	/** 群组踢人 */
	public setGroupKick( group_id: number, user_id: number, reject_add_request = false ) {
		return this.baseClient.fetchApi( "set_group_kick", { group_id, user_id, reject_add_request } );
	}
	
	/** 退出群组 */
	public setGroupLeave( group_id: number, is_dismiss = false ) {
		return this.baseClient.fetchApi( "set_group_leave", { group_id, is_dismiss } );
	}
	
	/** 获取版本信息 */
	public getVersionInfo() {
		return this.baseClient.fetchApi( "get_version_info", undefined );
	}
	
	/** 获取状态 */
	public getStatus() {
		return this.baseClient.fetchApi( "get_status", undefined );
	}
	
	
	/**
	 * @deprecated 删除好友
	 * @description go-cqhttp 限定，使用时需要判断返回值的 retcode 属性值是否为 1404（不存在）
	 */
	public deleteFriend( user_id: number ) {
		return this.baseClient.fetchApi( "delete_friend", { user_id } );
	}
	
	/**
	 * @deprecated 发送合并转发 ( 群聊 )
	 * @description go-cqhttp 限定，使用时需要判断返回值的 retcode 属性值是否为 1404（不存在）
	 */
	public sendGroupForwardMessage( group_id: number, messages: ForwardElem ) {
		if ( this.oneBotVersion?.app_name === "go-cqhttp" ) {
			return this.baseClient.fetchApi( "send_group_forward_msg", {
				group_id,
				messages: makeForwardMessage( messages )
			} );
		}
		return this.baseClient.fetchApi( "send_group_msg", {
			group_id,
			message: makeForwardMessage( messages )
		} )
	}
	
	/**
	 * @deprecated 发送合并转发 ( 好友 )
	 * @description go-cqhttp 限定，使用时需要判断返回值的 retcode 属性值是否为 1404（不存在）
	 */
	public sendPrivateForwardMessage( user_id: number, messages: ForwardElem ) {
		if ( this.oneBotVersion?.app_name === "go-cqhttp" ) {
			return this.baseClient.fetchApi( "send_private_forward_msg", {
				user_id,
				messages: makeForwardMessage( messages )
			} );
		}
		return this.baseClient.fetchApi( "send_private_msg", {
			user_id,
			message: makeForwardMessage( messages )
		} );
	}
	
	/**
	 * @deprecated 获取群消息历史记录
	 * @description go-cqhttp 限定，使用时需要判断返回值的 retcode 属性值是否为 1404（不存在）
	 */
	public async getGroupMsgHistory( group_id: number, message_seq: number ) {
		const result = await this.baseClient.fetchApi( "get_group_msg_history", { group_id, message_seq } );
		return this.getApiResponse( result, result.data && result.data.messages );
	}
	
	/**
	 * @deprecated 获取群 @全体成员 剩余次数
	 * @description go-cqhttp 限定，使用时需要判断返回值的 retcode 属性值是否为 1404（不存在）
	 */
	public getGroupAtAllRemain( group_id: number ) {
		return this.baseClient.fetchApi( "get_group_at_all_remain", { group_id } );
	}
}

export function createClient( config: BotConfig ): Client {
	return new Client( config );
}