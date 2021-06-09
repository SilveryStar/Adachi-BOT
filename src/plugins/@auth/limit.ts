import { CommonMessageEventData as Message } from "oicq";
import { Redis } from "../../bot";

async function main( sendMessage: ( content: string ) => any, message: Message ): Promise<void> {
	const data: string[] = message.raw_message.split( " " );
	const targetID: number = parseInt( data[0] );
	const [ , type, key, onOff ] = data;
	
	const dbKey: string = `adachi.${ type === "-u" ? "user": "group" }-command-limit-${ targetID }`;
	const reply: string = `${ type === "-u" ? "用户" : "群" } ${ targetID } 的 ${ key } 权限已 ${ onOff === "on" ? "开启" : "关闭" }`
	
	if ( onOff === "on" ) {
		await Redis.delListElement( dbKey, key );
	} else {
		await Redis.addListElement( dbKey, key );
	}
	
	await sendMessage( reply );
}

export { main }