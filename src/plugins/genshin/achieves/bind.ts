import { InputParameter } from "@modules/command";

export async function main( { sendMessage, messageData, redis }: InputParameter ): Promise<void> {
	const uid: string = messageData.raw_message;
	const userID: number = messageData.user_id;
	
	await redis.setString( `silvery-star.user-bind-uid-${ userID }`, uid );
	await sendMessage( "游戏UID绑定成功" );
}