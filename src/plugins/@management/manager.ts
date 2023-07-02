import { AuthLevel } from "@/modules/management/auth";
import { defineDirective } from "@/modules/command";

export default defineDirective( "switch", async ( { sendMessage, redis, matchResult } ) => {
	const isOn: boolean = matchResult.isOn();
	const userID: number = parseInt( matchResult.match[0] );
	
	if ( isOn ) {
		await redis.setString( `adachi.auth-level-${ userID }`, AuthLevel.Manager );
		await sendMessage( `用户 ${ userID } 已被设置为管理员` );
	} else {
		await redis.setString( `adachi.auth-level-${ userID }`, AuthLevel.User );
		await sendMessage( `用户 ${ userID } 的管理员权限已取消` );
	}
} );