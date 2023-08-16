import { AuthLevel } from "@/modules/management/auth";
import { defineDirective, SwitchMatchResult } from "@/modules/command";
import idParser from "#/@help/utils/id-parser";
import { MessageType } from "@/modules/message";

export default defineDirective( "switch", async ( { sendMessage, messageData, matchResult, redis, auth } ) => {
	const match = matchResult;
	const [ msgType, targetID ] = idParser( match.match[0] );
	const userID: number = messageData.user_id;
	
	/* 封禁 */
	if ( match.isOn ) {
		if ( msgType === MessageType.Group ) {
			await redis.addListElement( `adachi.banned-group`, targetID.toString() );
			await sendMessage( `群 ${ targetID } 已被屏蔽，将不触发任何指令` );
			return;
		}
		if ( targetID === userID ) {
			await sendMessage( "不能对自己进行操作" );
			return;
		}
		const targetAuth: AuthLevel = await auth.get( targetID );
		const mineAuth: AuthLevel = await auth.get( userID );
		if ( targetAuth >= mineAuth ) {
			await sendMessage( `你没有封禁用户 ${ targetID } 的权限` );
		} else {
			await redis.setString( `adachi.auth-level-${ targetID }`, AuthLevel.Banned );
			await sendMessage( `用户 ${ targetID } 已被设为封禁用户` );
		}
	}
	/* 解封 */
	else {
		if ( msgType === MessageType.Group ) {
			await redis.delListElement( `adachi.banned-group`, targetID.toString() );
			await sendMessage( `群 ${ targetID } 屏蔽已解除` );
		} else {
			await redis.setString( `adachi.auth-level-${ targetID }`, AuthLevel.User );
			await sendMessage( `用户 ${ targetID } 已被解封` );
		}
	}
} );