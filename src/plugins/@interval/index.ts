import { CommonMessageEventData as Message } from "oicq";
import { CommandMatchResult, SwitchMatch } from "../../modules/command";
import { sendType } from "../../modules/message";
import { interval } from "../../bot";

async function main( sendMessage: sendType, message: Message, match: CommandMatchResult ): Promise<void> {
	const data = match.data as SwitchMatch;
	const [ id, time ] = data.match;
	
	await interval.set( parseInt( id ), data.isOn() ? "group" : "private", parseInt( time ) );
	await sendMessage( `${ data.isOn() ? "群" : "用户" } ${ id } 的操作触发间隔已改为 ${ time }ms` );
}

export { main }