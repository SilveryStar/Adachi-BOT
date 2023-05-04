import bot from "ROOT";
import * as sdk from "icqq";
import BotConfig from "@/modules/config";

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

export type SendFunc = ( content: sdk.Sendable, allowAt?: boolean ) => Promise<sdk.MessageRet>;
export type Message = sdk.PrivateMessageEvent | sdk.GroupMessageEvent;

interface MsgManagementMethod {
	getSendMessageFunc( userID: number, type: MessageType, groupID?: number ): SendFunc;
	sendMaster( content: string ): Promise<void>;
}

function checkIterator( obj: sdk.MessageElem | Iterable<sdk.MessageElem | string> ): obj is Iterable<sdk.MessageElem | string> {
	return typeof obj[Symbol.iterator] === "function";
}

export default class MsgManagement implements MsgManagementMethod {
	private readonly master: number;
	private readonly atUser: boolean;
	private readonly client: sdk.Client;
	
	constructor( config: BotConfig, client: sdk.Client ) {
		this.master = config.master;
		this.atUser = config.atUser;
		this.client = client;
	}
	
	public getSendMessageFunc( userID: number | "all" | string, type: MessageType, groupID: number = -1 ): SendFunc {
		const client = this.client;
		const atUser = this.atUser;
		if ( type === MessageType.Private ) {
			return async function ( content ): Promise<sdk.MessageRet> {
				return client.pickUser( <number>userID ).sendMsg( content );
			}
		} else {
			return async function ( content, allowAt ): Promise<sdk.MessageRet> {
				if ( userID === 'all' ) {
					const number = await client.pickGroup( groupID ).getAtAllRemainder();
					allowAt = number > 0 ? allowAt : false;
				}
				const at = sdk.segment.at( userID );
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
				return await client.pickGroup( groupID ).sendMsg( content );
			}
		}
	}
	
	public async sendMaster( content: string ): Promise<void> {
		await this.client.pickUser( this.master ).sendMsg( content );
	}
}

export function removeStringPrefix( string: string, prefix: string ): string {
	if ( bot.config.header !== "" )
		return string.replace( new RegExp( `${ prefix.charAt(0) }|${ prefix.slice(1) }`, "g" ), '' );
	return string.replace( new RegExp( prefix, "g" ), '' );
}

export function isPrivateMessage( data: Message ): data is sdk.PrivateMessageEvent {
	return data.message_type === "private";
}

export function isGroupMessage( data: Message ): data is sdk.GroupMessageEvent {
	return data.message_type === "group";
}