import { defineDirective } from "@/modules/command";
import { dailyClass } from "#/genshin/init";

export default defineDirective( "order", async ( { sendMessage, messageData, matchResult } ) => {
	const userID: number = messageData.user_id;
	
	const week = Number.parseInt( matchResult.match[0] );
	
	const result = await dailyClass.getUserSubscription( userID, Number.isNaN( week ) ? week : undefined );
	await sendMessage( result );
} );