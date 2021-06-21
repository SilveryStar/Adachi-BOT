import { CommonMessageEventData as Message } from "oicq";
import { isGroupMessage, isPrivateMessage } from "../../modules/message";
import { groupCommands, privateCommands } from "../../bot";
import { AuthLevel, getAuthLevel } from "../../modules/auth";
import { Command } from "../../modules/command";

async function main( sendMessage: ( content: string ) => any, message: Message ): Promise<void> {
	let commands: Command[] = [];
	let commandId: number = parseInt( message.raw_message );
	const qqID: number = message.user_id;
	const auth: AuthLevel = await getAuthLevel( qqID );
	
	if ( isGroupMessage( message ) ) {
		commands = groupCommands[auth];
	}
	if ( isPrivateMessage( message ) ) {
		commands = privateCommands[auth];
	}
	
	const commandNum: number = commands.length;
	const noDisplay: number = commands.filter( el => !el.display ).length;
	if ( commandId > commandNum - noDisplay ) {
		await sendMessage( "未知的指令" );
		return;
	}
	
	for ( let comm of commands ) {
		if ( commandId === 1 ) {
			await sendMessage( comm.detail );
			return;
		} else if ( comm.display ) {
			commandId--;
		}
	}
}

export { main }