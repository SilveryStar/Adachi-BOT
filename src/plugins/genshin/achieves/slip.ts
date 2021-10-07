import { CommonMessageEventData as Message } from "oicq";
import { sendType } from "../../../modules/message";
import { slipClass } from "../init";

async function main( sendMessage: sendType, message: Message ): Promise<void> {
	const qqID: number = message.user_id;
	
	const result: string = await slipClass.get( qqID );
	await sendMessage( result );
}

export { main }