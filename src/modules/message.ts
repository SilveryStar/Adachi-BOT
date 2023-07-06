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

export type SendFunc = ( content: core.Sendable, allowAt?: boolean ) => Promise<number>;
export type Message = core.PrivateMessageEvent | core.GroupMessageEvent;

interface MsgManagementMethod {
	getSendMessageFunc( userID: number, type: MessageType, groupID?: number ): SendFunc;
	sendMaster( content: string ): Promise<void>;
}

function checkIterator( obj: core.MessageElem | Iterable<core.MessageElem | string> ): obj is Iterable<core.MessageElem | string> {
	return typeof obj[Symbol.iterator] === "function";
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
	
	public getSendMessageFunc( userID: number | "all" | string, type: MessageType, groupID: number = -1 ): SendFunc {
		const client = this.client;
		const atUser = this.atUser;
		if ( type === MessageType.Private ) {
			return function ( content ) {
				return client.sendPrivateMsg( <number>userID, content );
			}
		} else {
			return async function ( content, allowAt ): Promise<number> {
				if ( userID === "all" ) {
					const atAllRemain = await client.getGroupAtAllRemain( groupID );
					allowAt = atAllRemain.can_at_all ? allowAt : false;
				}
				const at = core.segment.at( userID );
				if ( atUser && allowAt !== false ) {
					if ( typeof content === "string" ) {
						const split = content.length < 60 ? " " : "\n";
						content = [ at, split, content ];
					} else if ( checkIterator( content ) ) {
						content = [ at, " ", ...content ];
					} else {
						content = [ at, " ", content ];
					}
				}
				return await client.sendGroupMsg( groupID, content );
			}
		}
	}
	
	public async sendMaster( content: string ): Promise<void> {
		await this.client.sendPrivateMsg( this.master, content );
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