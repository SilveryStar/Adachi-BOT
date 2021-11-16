import { InputParameter } from "@modules/command";
import { slipClass } from "../init";

export async function main( { sendMessage, messageData }: InputParameter ): Promise<void> {
	const qqID: number = messageData.user_id;
	
	const result: string = await slipClass.get( qqID );
	await sendMessage( result );
}