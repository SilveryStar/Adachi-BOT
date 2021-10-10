import { CommonMessageEventData as Message } from "oicq";
import { sendType } from "../../../modules/message";
import { dailyClass } from "../init";

async function main( sendMessage: sendType, message: Message ): Promise<void> {
	const qqID: number = message.user_id;
	
	const result: string = await dailyClass.getUserSubscription( qqID );
	await sendMessage( result );
}

export { main }