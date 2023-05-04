import { GroupMessageEvent } from "icqq";
import { AuthLevel } from "@/modules/management/auth";
import { BasicConfig, InputParameter } from "@/modules/command/main";
import Database from "@/modules/database";
import * as m from "@/modules/message";

function getMessageType( msg: m.Message ): m.MessageType {
	if ( m.isGroupMessage( msg ) ) {
		return m.MessageType.Group;
	} else if ( m.isPrivateMessage( msg ) ) {
		return m.MessageType.Private;
	} else {
		return m.MessageType.Unknown;
	}
}

async function getLimited( id: number, type: string, redis: Database ): Promise<string[]> {
	const dbKey: string = `adachi.${ type }-command-limit-${ id }`;
	return await redis.getList( dbKey );
}

export async function filterUserUsableCommand( i: InputParameter ): Promise<BasicConfig[]> {
	const userID: number = i.messageData.user_id;
	const type: m.MessageType = getMessageType( i.messageData );
	if ( type === m.MessageType.Unknown ) {
		return [];
	}
	
	const auth: AuthLevel = await i.auth.get( userID );
	let commands: BasicConfig[] = i.command
		.get( auth, type === m.MessageType.Group
			? m.MessageScope.Group : m.MessageScope.Private )
		.filter( el => el.display );

	const userLimit: string[] = await getLimited( userID, "user", i.redis );
	commands = commands.filter( el => !userLimit.includes( el.cmdKey ) );
	if ( type === m.MessageType.Private ) {
		return commands;
	}
	
	const groupID: number = ( <GroupMessageEvent>i.messageData ).group_id;
	const groupLimit: string[] = await getLimited( groupID, "group", i.redis );
	commands = commands.filter( el => !groupLimit.includes( el.cmdKey ) );
	return commands;
}