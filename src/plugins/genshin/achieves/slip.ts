import { CommonMessageEventData as Message } from "oicq";
import { slipClass } from "../init";

async function main( sendMessage: ( content: string ) => any, message: Message ): Promise<void> {
	const qqID: number = message.user_id;
	
	const result: string = await slipClass.get( qqID );
	await sendMessage( result );
}

export { main }