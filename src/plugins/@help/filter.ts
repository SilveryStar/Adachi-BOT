import { GroupMessageEventData } from "oicq";
import { AuthLevel } from "@modules/management/auth";
import { BasicConfig, InputParameter } from "@modules/command/main";
import { isGroupMessage, isPrivateMessage, Message, MessageScope, MessageType } from "@modules/message";
import Database from "@modules/database";

function getMessageType( msg: Message ): MessageType {
	if ( isGroupMessage( msg ) ) {
		return MessageType.Group;
	} else if ( isPrivateMessage( msg ) ) {
		return MessageType.Private;
	} else {
		return MessageType.Unknown;
	}
}

async function getLimited( id: number, type: string, redis: Database ): Promise<string[]> {
	const dbKey: string = `adachi.${ type }-command-limit-${ id }`;
	return await redis.getList( dbKey );
}

export async function filterUserUsableCommand( i: InputParameter ): Promise<BasicConfig[]> {
	const userID: number = i.messageData.user_id;
	const type: MessageType = getMessageType( i.messageData );
	if ( type === MessageType.Unknown ) {
		return [];
	}
	
	const auth: AuthLevel = await i.auth.get( userID );
	let commands: BasicConfig[] = await i.command.get( auth,
		type === MessageType.Group ? MessageScope.Group : MessageScope.Private
	);

	const userLimit: string[] = await getLimited( userID, "user", i.redis );
	commands = commands.filter( el => !userLimit.includes( el.cmdKey ) );
	if ( type === MessageType.Private ) {
		return commands;
	}
	
	const groupID: number = ( <GroupMessageEventData>i.messageData ).group_id;
	const groupLimit: string[] = await getLimited( groupID, "group", i.redis );
	commands = commands.filter( el => !groupLimit.includes( el.cmdKey ) );
	return commands;
}