import { CommonMessageEventData as Message } from "oicq";
import { isGroupMessage, isPrivateMessage } from "../../modules/message";
import { groupCommands, privateCommands } from "../../bot";
import { ROOTPATH } from "../../../app";
import { Command } from "../../modules/command";
import { AuthLevel, getAuthLevel } from "../../modules/auth";

function getVersion(): string {
	const { version } = require( `${ ROOTPATH }/package.json` );
	return version;
}

async function main( sendMessage: ( content: string ) => any, message: Message ): Promise<void> {
	let helpInfo: string = `Adachi-BOT v${ getVersion() }~`;
	let commands: Command[] = [];
	let id: number = 0;
	
	const auth: AuthLevel = await getAuthLevel( message.user_id );
	
	if ( isGroupMessage( message ) ) {
		commands = groupCommands[auth];
	}
	if ( isPrivateMessage( message ) ) {
		commands = privateCommands[auth];
	}

	for ( let comm of commands ) {
		if ( message.raw_message === "-k"  ) {
			helpInfo += `\n${ ++id }. ${ comm.getKeysInfo() }`
		} else if ( comm.display ) {
			helpInfo += `\n${ ++id }. ${ comm.getDocsInfo() }`;
		}
	}
	console.log(helpInfo);
	await sendMessage( helpInfo );
}

export { main }