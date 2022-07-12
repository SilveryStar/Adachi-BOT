import { InputParameter } from "@modules/command";
import { dailyClass } from "../init";

export async function main( { sendMessage, messageData }: InputParameter ): Promise<void> {
	const userID: number = messageData.user_id;
	
	const week = messageData.raw_message;
	
	const result: string = await dailyClass.getUserSubscription( userID, week ? parseInt( week ) : undefined );
	await sendMessage( result );
}