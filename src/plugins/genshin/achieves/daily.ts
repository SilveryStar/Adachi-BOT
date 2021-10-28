import { CommonMessageEventData as Message } from "oicq";
import { CommandMatchResult, SwitchMatch } from "../../../modules/command";
import { dailyClass } from "../init";

async function main( sendMessage: ( content: string ) => any, message: Message, match: CommandMatchResult ): Promise<void> {
	const qqID: number = message.user_id;
	const data = match.data as SwitchMatch;
	const name: string = data.match[0];
	const intReg: RegExp = new RegExp( /[0-9]+/g );

	const isGroupID: boolean = intReg.test( name ) && name.length >= 6;
	await sendMessage( await dailyClass.modifySubscription( qqID, data.isOn(), name, isGroupID ) );
}

export { main }