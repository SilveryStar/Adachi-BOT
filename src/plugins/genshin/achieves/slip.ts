import { defineDirective } from "@/modules/command";
import { slipClass } from "#/genshin/init";

export default defineDirective( "order", async ( { sendMessage, messageData } ) => {
	const userID: number = messageData.user_id;
	
	const result: string = await slipClass.get( userID );
	await sendMessage( result );
} );