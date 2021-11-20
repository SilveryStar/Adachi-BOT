import { InputParameter, SwitchMatchResult } from "@modules/command";
import idParser from "@utils/id-parser";
import { MessageType } from "@modules/message";

export async function main( { sendMessage, matchResult, redis }: InputParameter ): Promise<void> {
	const match = <SwitchMatchResult>matchResult;
	const states: string = match.isOn() ? "开启" : "关闭";
	
	const [ id, key ] = match.match;
	const [ type, targetID ] = idParser( id );
	
	let dbKey: string, reply: string;
	if ( type === MessageType.Private ) {
		dbKey = `adachi.user-command-limit-${ targetID }`;
		reply = `用户 ${ targetID } 的 ${ key } 权限已${ states }`;
	} else {
		dbKey = `adachi.group-command-limit-${ targetID }`;
		reply = `群聊 ${ targetID } 的 ${ key } 权限已${ states }`;
	}
	
	if ( match.isOn() ) {
		await redis.delListElement( dbKey, key );
	} else {
		await redis.addListElement( dbKey, key );
	}
	
	await sendMessage( reply );
}