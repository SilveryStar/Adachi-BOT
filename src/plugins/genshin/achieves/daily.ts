import { CommonMessageEventData as Message } from "oicq";
import { dailyClass } from "../init";

async function main( sendMessage: ( content: string ) => any, message: Message ): Promise<void> {
	const qqID: number = message.user_id;
	const [ operation, name ] = message.raw_message.split( " " );
	const intReg: RegExp = new RegExp( /[0-9]+/g );
	
	const isGroupID: boolean = intReg.test( name ) && name.length >= 6;
	await sendMessage( await dailyClass.modifySubscription( qqID, operation, name, isGroupID ) );
}

export { main }