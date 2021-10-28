import { CommonMessageEventData as Message } from "oicq";
import { SwitchMatch } from "../../../modules/command";
import { dailyClass } from "../init";

async function main( sendMessage: ( content: string ) => any, message: Message, match: SwitchMatch ): Promise<void> {
	const qqID: number = message.user_id;
	const [ name ] = match.match;
	
	const intReg: RegExp = new RegExp( /[0-9]+/g );

	const isGroupID: boolean = intReg.test( name ) && name.length >= 6;
	await sendMessage( await dailyClass.modifySubscription( qqID, match.isOn(), name, isGroupID ) );
}

export { main }