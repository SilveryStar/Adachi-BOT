import bot from "ROOT";
import { Private } from "#genshin/module/private/main";
import { Order } from "@modules/command";
import Authorization, { AuthLevel } from "@modules/management/auth";
import { privateClass } from "#genshin/init";

export async function getPrivateAccount( userID: number, idMsg: string, auth: Authorization ): Promise<string | Private> {
	const id: number = idMsg.length === 0 ? 0 : parseInt( idMsg ) - 1;
	
	const accounts: Private[] = privateClass.getUserPrivateList( userID );
	const a: AuthLevel = await auth.get( userID );
	if ( accounts.length === 0 ) {
		const PRIVATE_SUBSCRIBE = <Order>bot.command.getSingle( "silvery-star.private-subscribe", a );
		return `该指令已改为私人服务指令，请私聊 BOT 使用 ${ PRIVATE_SUBSCRIBE.getHeaders()[0] } 账号订阅`;
	} else if ( accounts.length - 1 < id || id === -1 ) {
		const PRIVATE_LIST = <Order>bot.command.getSingle( "silvery-star.private-list", a );
		return `无效的编号，请使用 ${ PRIVATE_LIST.getHeaders()[0] } 检查`;
	}
	
	return accounts[id];
}