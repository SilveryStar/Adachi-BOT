import { CommonMessageEventData as Message } from "oicq";
import { sendType } from "../../modules/message";
import { AuthLevel } from "../../modules/auth";
import { Redis } from "../../bot";

async function main( sendMessage: sendType, message: Message ): Promise<void> {
	const data: string[] = message.raw_message.split( " " );
	const targetID: number = parseInt( data[0] );
	
	if ( data[1] === "-u" ) {
		await Redis.setString( `adachi.auth-level-${ targetID }`, AuthLevel.User );
		await sendMessage( `用户 ${ targetID } 已被解封` );
	} else {
		await Redis.delListElement( `adachi.banned-group`, targetID );
		await sendMessage( `群 ${ targetID } 屏蔽已解除` );
	}
}

export { main }