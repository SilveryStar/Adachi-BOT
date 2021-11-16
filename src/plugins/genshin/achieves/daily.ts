import { InputParameter, SwitchMatchResult } from "@modules/command";
import { dailyClass } from "../init";

export async function main(
	{ sendMessage, messageData, matchResult }: InputParameter
): Promise<void> {
	const userID: number = messageData.user_id;
	const match = <SwitchMatchResult>matchResult;
	const [ name ] = match.match;
	
	const intReg: RegExp = new RegExp( /[0-9]+/g );

	const isGroupID: boolean = intReg.test( name ) && name.length >= 6;
	await sendMessage( await dailyClass.modifySubscription(
		userID, match.isOn(), name, isGroupID
	) );
}