import bot from "ROOT";
import * as core from "@/modules/lib";
import { BotConfig } from "@/modules/config";

export enum MessageScope {
	Neither,
	Group = 1 << 0,
	Private = 1 << 1,
	Both = Group | Private
}

export enum MessageType {
	Group,
	Private,
	Unknown
}

export type SendFunc = ( content: core.Sendable | core.ForwardElem, allowAt?: boolean ) => Promise<number>;
export type Message = core.PrivateMessageEvent | core.GroupMessageEvent;

interface MsgManagementMethod {
	getSendMessageFunc( userID: number | "all" | string, type: MessageType, groupID?: number ): SendFunc;
	createMessageSender( type: MessageType.Private, userID: number ): SendFunc;
	createMessageSender( type: MessageType.Group, groupID: number, userID?: number | "all" ): SendFunc;
	sendMaster( content: core.Sendable ): Promise<number | null>;
	sendMaster( content: core.ForwardElem ): Promise<core.SendForwardMessage | null>;
}

function checkIterator( obj: core.ForwardElem | core.MessageElem | Iterable<core.MessageElem | string> ): obj is Iterable<core.MessageElem | string> {
	return typeof obj[Symbol.iterator] === "function";
}

function checkoutForward( obj: core.Sendable | core.ForwardElem ): obj is core.ForwardElem {
	if ( typeof obj === "string" || checkIterator( obj ) ) {
		return false;
	}
	return obj.type === "forward";
}

export default class MsgManagement implements MsgManagementMethod {
	private master: number;
	private atUser: boolean;
	
	constructor( config: BotConfig["base"], private readonly client: core.Client ) {
		this.master = config.master;
		this.atUser = config.atUser;
		config.on( "refresh", newCfg => {
			this.master = newCfg.master;
			this.atUser = newCfg.atUser;
		} );
	}
	
	/**
	 * 生成一个用来发送私聊的方法
	 * @param type 发送的目标类型，固定为 1
	 * @param userID 目标用户 id
	 */
	public createMessageSender( type: MessageType.Private, userID: string | number ): SendFunc;
	/**
	 * 生成一个用来发送群聊的方法
	 * @description 返回值方面，与 getSendMessageFunc 不同的是，返回函数的 allowAt 参数优先级高于 atUser
	 * @param type 发送的目标类型，固定为 0
	 * @param groupID 目标群聊 id
	 * @param userID 目标用户 id，若为"all"则会@全体成员
	 */
	public createMessageSender( type: MessageType.Group, groupID: string | number, userID?: string | number ): SendFunc;
	public createMessageSender( type: MessageType, targetID: string | number, subID?: string | number ): SendFunc {
		const client = this.client;
		
		type MiddlewareRes = { status: true, data: number } | { status: false, content: core.Sendable };
		
		/* 发送转发消息 */
		const forwardMiddle = async ( content: core.Sendable | core.ForwardElem ): Promise<MiddlewareRes> => {
			if ( checkoutForward( content ) ) {
				const sendFun = type === MessageType.Group ? client.sendGroupForwardMessage : client.sendPrivateForwardMessage;
				const sendRes = await sendFun( <number>targetID, content );
				if ( sendRes.retcode === 0 ) {
					return { status: true, data: sendRes.data.message_id };
				}
				if ( sendRes.retcode === 1404 ) {
					content = "当前实现端不支持发送转发消息";
				} else {
					throw new Error( sendRes.wording || sendRes.msg );
				}
			}
			return { status: false, content }
		}
		if ( type === MessageType.Private ) {
			return async content => {
				const res = await forwardMiddle( content );
				if ( res.status ) return res.data;
				
				const sendRes = await client.sendPrivateMsg( <number>targetID, res.content );
				if ( sendRes.retcode === 0 ) return sendRes.data;
				
				throw new Error( sendRes.wording || sendRes.msg );
			}
		} else {
			return async ( content, allowAt = this.atUser ) => {
				const res = await forwardMiddle( content );
				if ( res.status ) return res.data;
				
				const buildAtMsg = async ( content: core.Sendable ) => {
					if ( !allowAt || subID === undefined ) return content;
					
					if ( subID === "all" ) {
						const atAllRemainRes = await client.getGroupAtAllRemain( <number>targetID );
						if ( atAllRemainRes.retcode === 0 ) {
							allowAt = atAllRemainRes.data.can_at_all && allowAt;
						}
					}
					
					const at = core.segment.at( subID );
					let split = " ";
					if ( typeof content === "string" && content.length >= 60 ) split = "\n";
					
					if ( !checkIterator( content ) ) content = [ content ];
					
					return [ at, split, ...content ]
				}
				
				const sendRes = await client.sendGroupMsg( <number>targetID, await buildAtMsg( res.content ) );
				if ( sendRes.retcode === 0 ) {
					return sendRes.data;
				}
				throw new Error( sendRes.wording || sendRes.msg );
			}
		}
	}
	
	/**
	 * 生成一个用来发送消息的方法
	 * @deprecated 改为使用 createMessageSender
	 * @param userID 目标用户id，若群聊方式发送则会自动@该用户，此时为"all"则会@全体成员。若为群内无指向消息，则可传入-1
	 * @param type 发送的目标类型，0为群聊，1为私聊
	 * @param groupID 目标群聊id，若为私聊则可忽略
	 */
	public getSendMessageFunc( userID: number | string, type: MessageType, groupID: number = -1 ): SendFunc {
		const client = this.client;
		const atUser = this.atUser;
		if ( type === MessageType.Private ) {
			return async content => {
				/* 发送转发消息 */
				if ( checkoutForward( content ) ) {
					const sendRes = await client.sendPrivateForwardMessage( <number>userID, content );
					if ( sendRes.retcode === 0 ) {
						return sendRes.data.message_id;
					}
					if ( sendRes.retcode === 1404 ) {
						content = "当前实现端不支持发送转发消息";
					} else {
						throw new Error( sendRes.wording || sendRes.msg );
					}
				}
				const sendRes = await client.sendPrivateMsg( <number>userID, content );
				if ( sendRes.retcode === 0 ) {
					return sendRes.data;
				}
				throw new Error( sendRes.wording || sendRes.msg );
			}
		} else {
			return async function ( content, allowAt ) {
				/* 发送转发消息 */
				if ( checkoutForward( content ) ) {
					const sendRes = await client.sendGroupForwardMessage( groupID, content );
					if ( sendRes.retcode === 0 ) {
						return sendRes.data.message_id;
					}
					if ( sendRes.retcode === 1404 ) {
						content = "当前实现端不支持发送转发消息";
					} else {
						throw new Error( sendRes.wording || sendRes.msg );
					}
				}
				
				const buildAtMsg = async ( content: core.Sendable ) => {
					if ( userID === "all" ) {
						const atAllRemainRes = await client.getGroupAtAllRemain( groupID );
						if ( atAllRemainRes.retcode === 0 ) {
							allowAt = atAllRemainRes.data.can_at_all ? allowAt : false;
						} else {
							allowAt = atAllRemainRes.retcode === 1404;
						}
						if ( !allowAt ) return content;
					} else {
						if ( !atUser || allowAt === false ) return content;
					}
					
					const at = core.segment.at( userID );
					if ( typeof content === "string" ) {
						const split = content.length < 60 ? " " : "\n";
						content = [ at, split, content ];
					} else if ( checkIterator( content ) ) {
						content = [ at, " ", ...content ];
					} else {
						content = [ at, " ", content ];
					}
					return content;
				}
				
				content = await buildAtMsg( content );
				
				const sendRes = await client.sendGroupMsg( groupID, content );
				if ( sendRes.retcode === 0 ) {
					return sendRes.data;
				}
				throw new Error( sendRes.wording || sendRes.msg );
			}
		}
	}
	
	public async sendMaster( content: core.Sendable ): Promise<number | null>
	public async sendMaster( content: core.ForwardElem ): Promise<core.SendForwardMessage | null>
	public async sendMaster( content: core.Sendable | core.ForwardElem ): Promise<core.SendForwardMessage | number | null> {
		let sendRes: core.ActionResponse;
		if ( checkoutForward( content ) ) {
			sendRes = await this.client.sendPrivateForwardMessage( this.master, content );
		} else {
			sendRes = await this.client.sendPrivateMsg( this.master, content );
		}
		return sendRes.retcode === 0 ? sendRes.data : null;
	}
}

export function removeStringPrefix( string: string, prefix: string ): string {
	if ( !bot.config.directive.header.length ) {
		return string.replace( new RegExp( `${ prefix.charAt(0) }|${ prefix.slice(1) }`, "g" ), "" );
	}
	return string.replace( new RegExp( prefix, "g" ), "" );
}

export function isPrivateMessage( data: Message ): data is core.PrivateMessageEvent {
	return data.message_type === "private";
}

export function isGroupMessage( data: Message ): data is core.GroupMessageEvent {
	return data.message_type === "group";
}