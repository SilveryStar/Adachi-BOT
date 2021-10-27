import { CommonMessageEventData as Message } from "oicq";
import { sendType } from "../../modules/message";
import { filterUserUsableCommand } from "./filter";

async function main( sendMessage: sendType, message: Message ): Promise<void> {
	const commands = await filterUserUsableCommand( message );
	const id: number = parseInt( message.raw_message );
	
	const length: number = commands.length;
	if ( id > length ) {
		await sendMessage( "未知的指令" );
		return;
	}
	
	await sendMessage( commands[id - 1].detail );
}

export { main }