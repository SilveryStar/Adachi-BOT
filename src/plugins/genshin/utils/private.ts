import bot from "ROOT";
import { Private, UserInfo } from "#genshin/module/private/main";
import { Order } from "@modules/command";
import Authorization, { AuthLevel } from "@modules/management/auth";
import { privateClass } from "#genshin/init";

export async function getPrivateSetting( userID: number, idMsg: string, auth: Authorization ): Promise<string | UserInfo> {
	const id: number = idMsg.length === 0 ? 0 : parseInt( idMsg ) - 1;
	
	const accounts: Private[] = privateClass.getUserPrivateList( userID );
	if ( accounts.length === 0 ) {
		return "该指令已改为私人服务指令，请私聊 BOT 进行账号订阅";
	} else if ( accounts.length - 1 < id ) {
		const a: AuthLevel = await auth.get( userID );
		const PRIVATE_LIST = <Order>bot.command.getSingle( "silvery-star.private-list", a );
		return `无效的编号，请使用 ${ PRIVATE_LIST.getHeaders()[0] } 检查`;
	}
	
	return accounts[id].setting;
}