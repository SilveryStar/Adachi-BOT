import { filterUserUsableCommand } from "../utils/filter";
import { InputParameter } from "@modules/command/main";

export async function main( i: InputParameter ): Promise<void> {
	const commands = await filterUserUsableCommand( i );
	const id: number = parseInt( i.messageData.raw_message );
	
	const length: number = commands.length;
	if ( id > length ) {
		await i.sendMessage( "未知的指令" );
		return;
	}
	
	await i.sendMessage( commands[id - 1].detail );
}