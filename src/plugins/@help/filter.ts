import {
	GroupMessageEventData,
	CommonMessageEventData as Message
} from "oicq";
import { Command } from "../../modules/command";
import { AuthLevel, getAuthLevel } from "../../modules/auth";
import { MessageType, isGroupMessage, isPrivateMessage } from "../../modules/message";
import { groupCommands, privateCommands, Redis } from "../../bot";

function getMessageType( msg: Message ): MessageType {
	if ( isGroupMessage( msg ) ) {
		return MessageType.Group;
	} else if ( isPrivateMessage( msg ) ) {
		return MessageType.Private;
	} else {
		return MessageType.Unknown;
	}
}

async function getCommandList( userID: number, type: MessageType ): Promise<Command[]> {
	const auth: AuthLevel = await getAuthLevel( userID );

	if ( type === MessageType.Group ) {
		return groupCommands[auth].filter( el => el.display );
	} else {
		return privateCommands[auth].filter( el => el.display );
	}
}

async function getLimited( id: number, type: string ): Promise<string[]> {
	const dbKey: string = `adachi.${ type }-command-limit-${ id }`;
	return await Redis.getList( dbKey );
}

export async function filterUserUsableCommand( msg: Message ): Promise<Command[]> {
	const qqID: number = msg.user_id;
	const type: MessageType = getMessageType( msg );
	if ( type === MessageType.Unknown ) {
		return [];
	}
	
	let commands: Command[] = await getCommandList( qqID, type );

	const userLimit: string[] = await getLimited( qqID, "user" );
	commands = commands.filter( el => !userLimit.includes( el.key ) );
	if ( type === MessageType.Private ) {
		return commands;
	}
	
	const groupID: number = ( msg as GroupMessageEventData ).group_id;
	const groupLimit: string[] = await getLimited( groupID, "group" );
	commands = commands.filter( el => !groupLimit.includes( el.key ) );
	return commands;
}