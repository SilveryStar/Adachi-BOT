import { CommonMessageEventData as Message, GroupMessageEventData, PrivateMessageEventData } from "oicq";
import { Adachi, botConfig } from "../bot";
import removePrefix = require( "remove-prefix" );

enum MessageScope {
	Neither,
	Group = 1 << 0,
	Private = 1 << 1,
	Both = Group | Private
}

enum MessageType {
	Group,
	Private
}

function getSendMessageFunc( qqID: number, type: MessageType, groupID?: number ): any {
	if ( type === MessageType.Private ) {
		return async function ( content: string ): Promise<void> {
			await Adachi.sendPrivateMsg( qqID, content );
		}
	} else if ( type === MessageType.Group ) {
		return async function ( content: string ): Promise<void> {
			if ( botConfig.atUser === true ) {
				content = `[CQ:at,qq=${ qqID }]\n${ content }`;
			}
			await Adachi.sendGroupMsg( groupID as number, content );
		}
	}
}

async function sendMaster( content: string ): Promise<void> {
	await Adachi.sendPrivateMsg( botConfig.master, content );
}

function removeStringPrefix( string: string, prefix: string ): string {
	return removePrefix( string, prefix )[0];
}

function isPrivateMessage( data: Message ): data is PrivateMessageEventData {
	return ( <PrivateMessageEventData | GroupMessageEventData>data ).message_type === "private";
}

function isGroupMessage( data: Message ): data is GroupMessageEventData {
	return ( <PrivateMessageEventData | GroupMessageEventData>data ).message_type === "group";
}

export {
	MessageScope,
	MessageType,
	getSendMessageFunc,
	sendMaster,
	removeStringPrefix,
	isGroupMessage,
	isPrivateMessage
}