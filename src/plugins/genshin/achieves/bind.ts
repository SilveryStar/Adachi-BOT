import { defineDirective } from "@/modules/command";

export default defineDirective( "order", async ( { sendMessage, messageData, matchResult, redis } ) => {
	const msg: string = messageData.raw_message;
	const userID: number = messageData.user_id;
	
	const dbKey = `silvery-star.user-bind-uid-${ userID }`;
	
	const params = matchResult.match[0];
	if ( params === "-r" ) {
		await redis.deleteKey( dbKey );
		await sendMessage( "UID解除绑定成功" );
	} else {
		await redis.setString( `silvery-star.user-bind-uid-${ userID }`, msg );
		await sendMessage( "游戏UID绑定成功" );
	}
} );