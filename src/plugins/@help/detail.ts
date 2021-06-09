import { CommonMessageEventData as Message } from "oicq";
import { isGroupMessage, isPrivateMessage } from "../../modules/message";
import { groupCommands, privateCommands } from "../../bot";
import { AuthLevel, getAuthLevel } from "../../modules/auth";
import { Command } from "../../modules/command";

async function main( sendMessage: ( content: string ) => any, message: Message ): Promise<void> {
	let commands: Command[] = [];
	const qqID: number = message.user_id;
	const commandId: number = parseInt( message.raw_message );
	const auth: AuthLevel = await getAuthLevel( qqID );
	
	if ( isGroupMessage( message ) ) {
		commands = groupCommands[auth];
	}
	if ( isPrivateMessage( message ) ) {
		commands = privateCommands[auth];
	}
	
	await sendMessage( commands[commandId-1].detail );
}

export { main }