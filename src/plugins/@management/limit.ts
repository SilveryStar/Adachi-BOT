import { InputParameter, SwitchMatchResult } from "@/modules/command";
import idParser from "#/@help/utils/id-parser";
import { MessageType } from "@/modules/message";
import { AuthLevel } from "@/modules/management/auth";

export async function main( { sendMessage, matchResult, messageData, auth, redis }: InputParameter ): Promise<void> {
	const match = <SwitchMatchResult>matchResult;
	const states: string = match.isOn() ? "开启" : "关闭";
	
	const userID: number = messageData.user_id;
	const [ id, key ] = match.match;
	const [ type, targetID ] = idParser( id );
	
	if ( type === MessageType.Private && !match.isOn() ) {
		if ( targetID === userID ) {
			await sendMessage( "不能对自己进行操作" );
			return;
		}
		const targetAuth: AuthLevel = await auth.get( targetID );
		const mineAuth: AuthLevel = await auth.get( userID );
		if ( targetAuth >= mineAuth ) {
			await sendMessage( `你没有限制用户 ${ targetID } 指令使用的权限` );
			return;
		}
	}
	
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