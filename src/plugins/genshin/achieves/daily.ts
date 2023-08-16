import { defineDirective } from "@/modules/command";
import { dailyClass } from "../init";

export default defineDirective( "switch", async ( { sendMessage, messageData, matchResult } ) => {
	const userID: number = messageData.user_id;
	const [ name ] = matchResult.match;
	
	const intReg: RegExp = new RegExp( /\d+/g );
	
	const isGroupID: boolean = intReg.test( name ) && name.length >= 6;
	const result: string = isGroupID
		? await dailyClass.modifySubscriptGroup( name, matchResult.isOn )
		: await dailyClass.modifySubscriptUser( userID, matchResult.isOn, name );
	
	await sendMessage( result );
} );