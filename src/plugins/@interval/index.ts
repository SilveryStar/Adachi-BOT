import { CommonMessageEventData as Message } from "oicq";
import { SwitchMatch } from "../../modules/command";
import { sendType } from "../../modules/message";
import { interval } from "../../bot";

async function main( sendMessage: sendType, message: Message, match: SwitchMatch ): Promise<void> {
	const [ id, time ] = match.match;
	
	await interval.set( parseInt( id ), match.isOn() ? "group" : "private", parseInt( time ) );
	await sendMessage( `${ match.isOn() ? "群" : "用户" } ${ id } 的操作触发间隔已改为 ${ time }ms` );
}

export { main }