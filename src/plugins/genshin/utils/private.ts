import bot from "ROOT";
import { Private } from "#/genshin/module/private/main";
import { Order } from "@/modules/command";
import Authorization, { AuthLevel } from "@/modules/management/auth";
import { privateClass } from "#/genshin/init";

function parseID( msg: string ): number {
	if ( !msg ) {
		bot.logger.debug( `消息段解析调试: ${ msg }` );
		return 0;
	}
	const id: number = parseInt( msg );
	if ( !Number.isNaN( id ) ) {
		return id - 1;
	}
	bot.logger.warn( `消息段解析出现异常: ${ msg }` );
	
	const res: string[] | null = msg.match( /(\d+)/g );
	if ( res ) {
		const list: string[] = res.sort( ( x, y ) => x.length - y.length );
		return parseInt( list[0] ) - 1;
	} else {
		return 0;
	}
}

export async function getPrivateAccount( userID: number, idMsg: string, auth: Authorization ): Promise<string | Private> {
	const id: number = parseID( idMsg );
	
	const accounts: Private[] = privateClass.getUserPrivateList( userID );
	const a: AuthLevel = await auth.get( userID );
	if ( accounts.length === 0 ) {
		const PRIVATE_SUBSCRIBE = <Order>bot.command.getSingle( "silvery-star.private-subscribe", a );
		const appendMsg = PRIVATE_SUBSCRIBE ? `请私聊 BOT 使用 ${ PRIVATE_SUBSCRIBE.getHeaders()[0] } 账号订阅` : "BOT 持有者已关闭私人服务订阅";
		return `该指令已改为私人服务指令，${ appendMsg }`;
	} else if ( accounts.length - 1 < id || id === -1 ) {
		const PRIVATE_LIST = <Order>bot.command.getSingle( "silvery-star.private-list", a );
		const appendMsg = PRIVATE_LIST ? `，请使用 ${ PRIVATE_LIST.getHeaders()[0] } 检查` : "";
		return `无效的序号${ appendMsg }`;
	}
	
	return accounts[id];
}