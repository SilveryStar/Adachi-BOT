import { CommonMessageEventData as Message } from "oicq";
import { sendType } from "../../../modules/message";
import { Redis } from "../../../bot";

async function main( sendMessage: sendType, message: Message ): Promise<void> {
	const mysID: string = message.raw_message;
	const qqID: number = message.user_id;
	
	await Redis.setString( `silvery-star.user-bind-id-${ qqID }`, mysID );
	await sendMessage( "米游社通行证绑定成功" );
}

export { main }