import { CommonMessageEventData as Message } from "oicq";
import { Redis } from "../../bot";
import { AuthLevel } from "../../modules/auth";

async function main( sendMessage: ( content: string ) => any, message: Message ): Promise<void> {
	const qqID: number = parseInt( message.raw_message );
	await Redis.setString( `adachi.auth-level-${ qqID }`, AuthLevel.Manager );
	await sendMessage( `用户 ${ qqID } 已被设置为管理员` );
}

export { main }