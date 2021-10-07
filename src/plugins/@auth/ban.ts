import { CommonMessageEventData as Message } from "oicq";
import { sendType } from "../../modules/message";
import { Redis } from "../../bot";
import { AuthLevel, getAuthLevel } from "../../modules/auth";

async function main( sendMessage: sendType, message: Message ): Promise<void> {
	const data: string[] = message.raw_message.split( " " );
	
	const targetID: number = parseInt( data[0] );
	const targetAuth: AuthLevel = await getAuthLevel( targetID );
	const mineAuth: AuthLevel = await getAuthLevel( message.user_id );
	
	if ( data[1] === "-u" ) {
		if ( targetAuth >= mineAuth ) {
			await sendMessage( `你没有封禁用户 ${ targetID } 的权限` );
		} else {
			await Redis.setString( `adachi.auth-level-${ targetID }`, AuthLevel.Banned );
			await sendMessage( `用户 ${ targetID } 已被设为封禁用户` );
		}
	} else {
		await Redis.addListElement( `adachi.banned-group`, targetID );
		await sendMessage( `群 ${ targetID } 已被屏蔽，将不触发任何指令` );
	}
}

export { main }