import { CommonMessageEventData as Message } from "oicq";
import { Redis } from "../../bot";
import { AuthLevel } from "../../modules/auth";

async function main( sendMessage: ( content: string ) => any, message: Message ): Promise<void> {
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