import { CommonMessageEventData as Message } from "oicq";
import { Redis } from "../../bot";
import { AuthLevel } from "../../modules/auth";

async function main( sendMessage: ( content: string ) => any, message: Message ): Promise<void> {
	const qqID: number = parseInt( message.raw_message );
	await Redis.setString( `adachi.auth-level-${ qqID }`, AuthLevel.User );
	await sendMessage( `用户 ${ qqID } 的管理员权限已取消` );
}

export { main }