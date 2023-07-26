import BaseClient from "./core/base-client";
import { BotConfig } from "@/modules/config";
import CoreLogger from "./core/logger";
import { getLogger, Logger } from "log4js";
import { ActionRequest, ActionResponse } from "./types/action";
import { EventMap } from "./types/map/event";
import {
	FriendInfo,
	GroupInfo,
	SetQqProfileParam,
	UploadGroupFileParam,
	UploadPrivateFileParam
} from "@/modules/lib/types/api";
import { Anonymous, HonorType, RecordFormat } from "@/modules/lib/types/common";
import { ForwardElem, Sendable } from "./types/element/send";
import { formatSendMessage, makeForwardMessage } from "@/modules/lib/message";

export type LogLevel = "trace" | "debug" | "info" | "warn" | "error" | "fatal" | "mark" | "off";

export class Client {
	private baseClient: BaseClient;
	
	constructor( private config: BotConfig ) {
		this.baseClient = BaseClient.getInstance( config.base.wsServer );
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
	
	set gl( data: Map<number, GroupInfo> ) {
		this.baseClient.gl = data;
	}
	
	get fl() {
		return this.baseClient.fl;
	}
	
	set fl( data: Map<number, FriendInfo> ) {
		this.baseClient.fl = data;
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
	
	set uin( uin: number ) {
		this.baseClient.uin = uin;
	}
	
	private initLogger( uin: number, logLevel: string ) {
		this.uin = uin;
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
			if ( newCfg.wsServer !== oldCfg.wsServer ) {
				this.baseClient.setTarget( newCfg.wsServer );
				this.reConnect();
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
		this.baseClient.on( event, listener );
	}
	
	public once<T extends keyof EventMap>( event: T, listener: EventMap[T] ) {
		this.baseClient.once( event, listener );
	}
	
	public off<T extends keyof EventMap>( event: T, listener: EventMap[T] ) {
		this.baseClient.off( event, listener );
	}
	
	public async connect() {
		await this.baseClient.connect();
	}
	
	public closeConnect() {
		this.baseClient.closeConnect();
	}
	
	public reConnect() {
		this.baseClient.reConnect();
	}
	
	/** 自行请求 gocq api */
	public fetchGoCq( action: string, params: any ) {
		return this.baseClient.fetchApi( <any>action, params );
	}
	
	/** 重载群列表 */
	public async reloadGroupList() {
		const data = await this.getGroupList( true );
		this.gl = data.retcode === 0
			? new Map( data.data.map( data => [ data.group_id, data ] ) )
			: new Map();
	}
	
	/** 重载好友列表 */
	public async reloadFriendList() {
		const data = await this.getFriendList();
		this.fl = data.retcode === 0
			? new Map( data.data.map( data => [ data.user_id, data ] ) )
			: new Map();
	}
	
	/** 获取登录号信息 */
	public getLoginInfo() {
		return this.baseClient.fetchApi( "get_login_info", undefined )
	}
	
	/** 设置登录号资料 */
	public setLoginInfo( info: SetQqProfileParam ) {
		return this.baseClient.fetchApi( "set_qq_profile", info );
	}
	
	private getApiResponse<T>( result: ActionResponse<any>, data: T ): ActionResponse<T> {
		return <any>{
			...result,
			data
		}
	}
	
	/** 获取在线机型 */
	public async getModelShow( model: string ) {
		const result = await this.baseClient.fetchApi( "_get_model_show", { model } );
		return this.getApiResponse( result, result.data && result.data.variants );
	}
	
	/** 设置在线机型 */
	public setModelShow( model: string, model_show: string ) {
		return this.baseClient.fetchApi( "_set_model_show", { model, model_show } );
	}
	
	/** 获取当前账号在线客户端列表 */
	public async getOnlineClients( no_cache = false ) {
		const result = await this.baseClient.fetchApi( "get_online_clients", { no_cache } );
		return this.getApiResponse( result, result.data && result.data.clients );
	}
	
	/** 获取陌生人信息 */
	public getStrangerInfo( user_id: number, no_cache = false ) {
		return this.baseClient.fetchApi( "get_stranger_info", { user_id, no_cache } );
	}
	
	/** 获取好友列表 */
	public getFriendList() {
		return this.baseClient.fetchApi( "get_friend_list", undefined );
	}
	
	/** 获取单向好友列表 */
	public getUnidirectionalFriendList() {
		return this.baseClient.fetchApi( "get_unidirectional_friend_list", undefined );
	}
	
	/** 删除好友 */
	public deleteFriend( user_id: number ) {
		return this.baseClient.fetchApi( "delete_friend", { user_id } );
	}
	
	/** 删除单向好友 */
	public deleteUnidirectionalFriend( user_id: number ) {
		return this.baseClient.fetchApi( "delete_unidirectional_friend", { user_id } );
	}
	
	/** 发送私聊消息 */
	public async sendPrivateMsg( user_id: number, message: Sendable ) {
		const result = await this.baseClient.fetchApi( "send_private_msg", {
			user_id,
			message: formatSendMessage( message )
		} );
		return this.getApiResponse( result, result.data && result.data.message_id );
	}
	
	/** 发送临时会话消息 */
	public async sendPrivateTempMsg( user_id: number, message: Sendable, group_id?: number ) {
		const result = await this.baseClient.fetchApi( "send_private_msg", {
			user_id,
			message: formatSendMessage( message ),
			group_id
		} );
		return this.getApiResponse( result, result.data && result.data.message_id );
	}
	
	/** 发送群聊消息 */
	public async sendGroupMsg( group_id: number, message: Sendable ) {
		const result = await this.baseClient.fetchApi( "send_group_msg", {
			group_id,
			message: formatSendMessage( message )
		} );
		return this.getApiResponse( result, result.data && result.data.message_id );
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
		return this.getApiResponse( result, result.data && result.data.message_id );
	}
	
	/** 获取消息 */
	public getMessage( message_id: number ) {
		return this.baseClient.fetchApi( "get_msg", { message_id } );
	}
	
	/** 撤回消息 */
	public recallMessage( message_id: number ) {
		return this.baseClient.fetchApi( "delete_msg", { message_id } );
	}
	
	/** 标记消息已读 */
	public markMsgAsReadMessage( message_id: number ) {
		return this.baseClient.fetchApi( "mark_msg_as_read", { message_id } );
	}
	
	/** 获取合并转发内容 */
	public async getForwardMessage( message_id: number ) {
		const result = await this.baseClient.fetchApi( "get_forward_msg", { message_id } );
		return this.getApiResponse( result, result.data && result.data.messages );
	}
	
	/** 发送合并转发 ( 群聊 ) */
	public sendGroupForwardMessage( group_id: number, messages: ForwardElem ) {
		return this.baseClient.fetchApi( "send_group_forward_msg", {
			group_id,
			messages: makeForwardMessage( messages )
		} );
	}
	
	/** 发送合并转发 ( 好友 ) */
	public sendPrivateForwardMessage( user_id: number, messages: ForwardElem ) {
		return this.baseClient.fetchApi( "send_private_forward_msg", {
			user_id,
			messages: makeForwardMessage( messages )
		} );
	}
	
	/** 获取群消息历史记录 */
	public async getGroupMsgHistory( group_id: number, message_seq: number ) {
		const result = await this.baseClient.fetchApi( "get_group_msg_history", { group_id, message_seq } );
		return this.getApiResponse( result, result.data && result.data.messages );
	}
	
	/** 获取图片信息 */
	public getImage( file: string ) {
		return this.baseClient.fetchApi( "get_image", { file } );
	}
	
	/** 检查是否可以发送图片 */
	public async canSendImage() {
		const result = await this.baseClient.fetchApi( "can_send_image", undefined );
		return this.getApiResponse( result, result.data && result.data.yes );
	}
	
	/** 图片 OCR */
	public ocrImage( image: string ) {
		return this.baseClient.fetchApi( "ocr_image", { image } );
	}
	
	/** 获取语音 */
	public async getRecord( file: string, out_format: RecordFormat ) {
		const result = await this.baseClient.fetchApi( "get_record", { file, out_format } );
		return this.getApiResponse( result, result.data && result.data.file );
	}
	
	/** 获取语音 */
	public async canSendRecord( file: string, out_format: RecordFormat ) {
		const result = await this.baseClient.fetchApi( "can_send_record", undefined );
		return this.getApiResponse( result, result.data && result.data.yes );
	}
	
	/** 处理加好友请求 */
	public setFriendAddRequest( flag: string, approve?: boolean, remark?: string ) {
		return this.baseClient.fetchApi( "set_friend_add_request", { flag, approve, remark } );
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
		return this.baseClient.fetchApi( "get_group_list", { no_cache } );
	}
	
	/** 获取群成员信息 */
	public getGroupMemberInfo( group_id: number, user_id: number, no_cache = false ) {
		return this.baseClient.fetchApi( "get_group_member_info", { group_id, user_id, no_cache } );
	}
	
	/** 获取群成员列表 */
	public getGroupMemberList( group_id: number, no_cache = false ) {
		return this.baseClient.fetchApi( "get_group_member_list", { group_id, no_cache } );
	}
	
	/** 获取群荣誉信息 */
	public getGroupHonorInfo( group_id: number, type: HonorType | "all", no_cache = false ) {
		return this.baseClient.fetchApi( "get_group_honor_info", { group_id, type, no_cache } );
	}
	
	/** 获取群系统消息 */
	public getGroupSystemMessage() {
		return this.baseClient.fetchApi( "get_group_system_msg", undefined );
	}
	
	/** 获取精华消息列表 */
	public getEssenceMessageList( group_id: number ) {
		return this.baseClient.fetchApi( "get_essence_msg_list", { group_id } );
	}
	
	/** 获取群 @全体成员 剩余次数 */
	public getGroupAtAllRemain( group_id: number ) {
		return this.baseClient.fetchApi( "get_group_at_all_remain", { group_id } );
	}
	
	/** 设置群名 */
	public setGroupName( group_id: number, group_name: string ) {
		return this.baseClient.fetchApi( "set_group_name", { group_id, group_name } );
	}
	
	/** 设置群头像 */
	public setGroupPortrait( group_id: number, file: string, cache = true ) {
		return this.baseClient.fetchApi( "set_group_portrait", {
			group_id,
			file,
			cache: cache ? 1 : 0
		} );
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
	
	/** 设置精华消息 */
	public setEssenceMessage( message_id: number ) {
		return this.baseClient.fetchApi( "set_essence_msg", { message_id } );
	}
	
	/** 移出精华消息 */
	public deleteEssenceMessage( message_id: number ) {
		return this.baseClient.fetchApi( "delete_essence_msg", { message_id } );
	}
	
	/** 群打卡 */
	public sendGroupSign( group_id: number ) {
		return this.baseClient.fetchApi( "send_group_sign", { group_id } );
	}
	
	/** 群设置匿名 */
	public sendGroupAnonymous( group_id: number, enable = true ) {
		return this.baseClient.fetchApi( "set_group_anonymous", { group_id, enable } );
	}
	
	/** 发送群公告 */
	public sendGroupNotice( group_id: number, content: string, image?: string ) {
		return this.baseClient.fetchApi( "_send_group_notice", { group_id, content, image } );
	}
	
	/** 群组踢人 */
	public setGroupKick( group_id: number, user_id: number, reject_add_request = false ) {
		return this.baseClient.fetchApi( "set_group_kick", { group_id, user_id, reject_add_request } );
	}
	
	/** 退出群组 */
	public setGroupLeave( group_id: number, is_dismiss = false ) {
		return this.baseClient.fetchApi( "set_group_leave", { group_id, is_dismiss } );
	}
	
	/** 上传群文件 */
	public uploadGroupFile( group_id: number, file: Omit<UploadGroupFileParam, "group_id"> ) {
		return this.baseClient.fetchApi( "upload_group_file", { group_id, ...file } );
	}
	
	/** 删除群文件 */
	public deleteGroupFile( group_id: number, file_id: string, busid: number ) {
		return this.baseClient.fetchApi( "delete_group_file", { group_id, file_id, busid } );
	}
	
	/** 创建群文件文件夹 */
	public createGroupFileFolder( group_id: number, name: string ) {
		return this.baseClient.fetchApi( "create_group_file_folder", { group_id, name, parent_id: "/" } );
	}
	
	/** 删除群文件文件夹 */
	public deleteGroupFileFolder( group_id: number, folder_id: string ) {
		return this.baseClient.fetchApi( "delete_group_folder", { group_id, folder_id } );
	}
	
	/** 获取群文件系统信息 */
	public getGroupFileSystemInfo( group_id: number ) {
		return this.baseClient.fetchApi( "get_group_file_system_info", { group_id } );
	}
	
	/** 获取群根目录文件列表 */
	public getGroupRootFiles( group_id: number ) {
		return this.baseClient.fetchApi( "get_group_root_files", { group_id } );
	}
	
	/** 获取群子目录文件列表 */
	public getGroupFilesByFolder( group_id: number, folder_id: string ) {
		return this.baseClient.fetchApi( "get_group_files_by_folder", { group_id, folder_id } );
	}
	
	/** 获取群文件资源链接 */
	public async getGroupFileUrl( group_id: number, file_id: string, busid: number ) {
		const result = await this.baseClient.fetchApi( "get_group_file_url", { group_id, file_id, busid } );
		return this.getApiResponse( result, result.data && result.data.url );
	}
	
	/** 上传私聊文件 */
	public uploadPrivateFile( user_id: number, file: Omit<UploadPrivateFileParam, "user_id"> ) {
		return this.baseClient.fetchApi( "upload_private_file", { user_id, ...file } );
	}
	
	/** 获取版本信息 */
	public getVersionInfo() {
		return this.baseClient.fetchApi( "get_version_info", undefined );
	}
	
	/** 获取状态 */
	public getStatus() {
		return this.baseClient.fetchApi( "get_status", undefined );
	}
	
	/** 重载事件过滤器 */
	public reloadEventFilter( file: string ) {
		return this.baseClient.fetchApi( "reload_event_filter", { file } );
	}
	
	/** 下载文件到缓存目录 */
	public async downloadFile( url: string, thread_count?: number, headers?: string | string[] ) {
		const result = await this.baseClient.fetchApi( "download_file", { url, thread_count, headers } );
		return this.getApiResponse( result, result.data && result.data.file );
	}
	
	/** 检查链接安全性 */
	public async checkUrlSafely( url: string ) {
		const result = await this.baseClient.fetchApi( "check_url_safely", { url } );
		return this.getApiResponse( result, result.data && result.data.level );
	}
	
	/** 获取中文分词 ( 隐藏 API ) */
	public async getWordSlices( content: string ) {
		const result = await this.baseClient.fetchApi( ".get_word_slices", { content } );
		return this.getApiResponse( result, result.data && result.data.slices );
	}
}

export function createClient( config: BotConfig ): Client {
	return new Client( config );
}