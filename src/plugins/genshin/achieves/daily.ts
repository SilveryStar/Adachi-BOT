import { InputParameter, SwitchMatchResult } from "@/modules/command";
import { dailyClass } from "../init";

export async function main(
	{ sendMessage, messageData, matchResult }: InputParameter
): Promise<void> {
	const userID: number = messageData.user_id;
	const match = <SwitchMatchResult>matchResult;
	const [ name ] = match.match;
	
	const intReg: RegExp = new RegExp( /\d+/g );
	
	const isGroupID: boolean = intReg.test( name ) && name.length >= 6;
	const result: string = isGroupID
		? await dailyClass.modifySubscriptGroup( name, match.isOn() )
		: await dailyClass.modifySubscriptUser( userID, match.isOn(), name );
	
	await sendMessage( result );
}