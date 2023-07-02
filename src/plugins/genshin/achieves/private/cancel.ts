import { UserInfo } from "#/genshin/module/private/main";
import { defineDirective } from "@/modules/command";
import { privateClass } from "#/genshin/init";

async function cancelPrivate( userID: number, id: number ): Promise<string> {
	const settings: UserInfo[] = privateClass.getUserInfoList( userID );
	if ( settings.length === 0 ) {
		return "你还未启用任何私人服务";
	}
	
	return privateClass.delSinglePrivate( userID, id );
}

export default defineDirective( "order", async ( { sendMessage, matchResult, messageData } ) => {
	const id: number = parseInt( matchResult.match[0] );
	const userID: number = messageData.user_id;
	const msg: string = await cancelPrivate( userID, id );
	await sendMessage( msg );
} );