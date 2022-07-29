import * as sdk from "oicq";
import BotConfig from "@modules/config";
import { MessageElem } from "oicq";

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

export type SendFunc = ( content: sdk.Sendable, allowAt?: boolean ) => Promise<void>;
export type Message = sdk.PrivateMessageEventData | sdk.GroupMessageEventData;

interface MsgManagementMethod {
	getSendMessageFunc( userID: number, type: MessageType, groupID?: number ): SendFunc;
	sendMaster( content: string ): Promise<void>;
}

function checkIterator( obj: MessageElem | Iterable<MessageElem | string> ): obj is Iterable<MessageElem | string> {
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
	
	public getSendMessageFunc( userID: number, type: MessageType, groupID: number = -1 ): SendFunc {
		const client = this.client;
		const atUser = this.atUser;
		if ( type === MessageType.Private ) {
			return async function ( content ): Promise<void> {
				await client.sendPrivateMsg( userID, content );
			}
		} else {
			return async function ( content, allowAt ): Promise<void> {
				const at = sdk.segment.at( userID )
				const space = sdk.segment.text(" ");
				if ( atUser && allowAt !== false ) {
					if ( typeof content === "string" ) {
						const split = content.length < 60 ? " " : "\n";
						content = sdk.cqcode.at( userID ) + split + content;
					} else if ( checkIterator( content ) ) {
						// @ts-ignore
						content = [ at, space, ...content ];
					} else {
						const data = ( "data" in content && content.data ) ? Object.values( content.data ) : []
						content = [ at, space, sdk.segment[content.type]( ...data ) ];
					}
				}
				await client.sendGroupMsg( <number>groupID, content );
			}
		}
	}
	
	public async sendMaster( content: string ): Promise<void> {
		await this.client.sendPrivateMsg( this.master, content );
	}
}

export function removeStringPrefix( string: string, prefix: string ): string {
	return string.replace( prefix, "" );
}

export function isPrivateMessage( data: Message ): data is sdk.PrivateMessageEventData {
	return data.message_type === "private";
}

export function isGroupMessage( data: Message ): data is sdk.GroupMessageEventData {
	return data.message_type === "group";
}