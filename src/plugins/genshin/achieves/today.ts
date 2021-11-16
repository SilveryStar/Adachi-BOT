import { InputParameter } from "@modules/command";
import { dailyClass } from "../init";

export async function main( { sendMessage, messageData }: InputParameter ): Promise<void> {
	const userID: number = messageData.user_id;
	
	const result: string = await dailyClass.getUserSubscription( userID );
	await sendMessage( result );
}