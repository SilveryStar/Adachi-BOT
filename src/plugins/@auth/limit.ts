import { CommonMessageEventData as Message } from "oicq";
import { SwitchMatch } from "../../modules/command";
import { sendType } from "../../modules/message";
import { Redis } from "../../bot";

async function main( sendMessage: sendType, message: Message, match: SwitchMatch ): Promise<void> {
	const [ targetID, type, key ] = match.match;

	const dbKey: string = `adachi.${ type === "-u" ? "user": "group" }-command-limit-${ targetID }`;
	const reply: string = `${ type === "-u" ? "用户" : "群" } ${ targetID } 的 ${ key } 权限已${ match.isOn() ? "开启" : "关闭" }`
	
	if ( match.isOn() ) {
		await Redis.delListElement( dbKey, key );
	} else {
		await Redis.addListElement( dbKey, key );
	}
	
	await sendMessage( reply );
}

export { main }