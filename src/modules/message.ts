import * as sdk from "oicq";
import BotConfig from "@modules/config";

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

export default class MsgManagement {
	private readonly master: number;
	private readonly atUser: boolean;
	private readonly client: sdk.Client;
	
	constructor( config: BotConfig, client: sdk.Client ) {
		this.master = config.master;
		this.atUser = config.atUser;
		this.client = client;
	}
	
	public getSendMessageFunc( qqID: number, type: MessageType, groupID: number = -1 ): SendFunc {
		const client = this.client;
		const atUser = this.atUser;
		if ( type === MessageType.Private ) {
			return async function( content ): Promise<void> {
				await client.sendPrivateMsg( qqID, content );
			}
		} else {
			return async function( content, allowAt ): Promise<void> {
				if ( atUser && allowAt !== false ) {
					content = sdk.cqcode.at( qqID ) + content;
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