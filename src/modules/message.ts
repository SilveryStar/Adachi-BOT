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

function getSendMessageFunc( targetID: number, type: MessageType ): any {
	if ( type === MessageType.Private ) {
		return async function ( content: string ): Promise<void> {
			await Adachi.sendPrivateMsg( targetID, content );
		}
	} else if ( type === MessageType.Group ) {
		return async function ( content: string ): Promise<void> {
			await Adachi.sendGroupMsg( targetID, content );
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
	return data.message_type === "private";
}

function isGroupMessage( data: Message ): data is GroupMessageEventData {
	return data.message_type === "group";
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