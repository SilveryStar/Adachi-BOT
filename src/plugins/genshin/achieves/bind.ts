import { InputParameter, OrderMatchResult } from "@/modules/command";

export async function main( { sendMessage, messageData, matchResult, redis }: InputParameter ): Promise<void> {
	const msg: string = messageData.raw_message;
	const userID: number = messageData.user_id;
	
	const dbKey = `silvery-star.user-bind-uid-${ userID }`;
	
	const params = ( <OrderMatchResult>matchResult ).match;
	if ( params[0] === "-r" ) {
		await redis.deleteKey( dbKey );
		await sendMessage( "UID解除绑定成功" );
	} else {
		await redis.setString( `silvery-star.user-bind-uid-${ userID }`, msg );
		await sendMessage( "游戏UID绑定成功" );
	}
}