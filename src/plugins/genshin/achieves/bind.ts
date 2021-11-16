import { InputParameter } from "@modules/command";

export async function main( { sendMessage, messageData, redis }: InputParameter ): Promise<void> {
	const mysID: string = messageData.raw_message;
	const qqID: number = messageData.user_id;
	
	await redis.setString( `silvery-star.user-bind-id-${ qqID }`, mysID );
	await sendMessage( "米游社通行证绑定成功" );
}