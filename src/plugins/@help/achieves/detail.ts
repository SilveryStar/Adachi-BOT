import { filterUserUsableCommand } from "#/@help/utils/filter";
import { InputParameter } from "@/modules/command/main";

export async function main( i: InputParameter ): Promise<void> {
	const commands = await filterUserUsableCommand( i );
	const id: number = parseInt( i.messageData.raw_message );
	
	const length: number = commands.length;
	if ( id > length ) {
		await i.sendMessage( "未知的指令" );
		return;
	}
	
	const command = commands[id - 1];
	const { headers, param } = command.getFollow();
	const follow = `${ headers.join( "|" ) } ${ param }`;
	const detail = command.detail;
	
	const message = `指令格式：${ follow }\n指令说明：${ detail }`;
	await i.sendMessage( message );
}