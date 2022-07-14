import { AuthLevel } from "@modules/management/auth";
import { Private } from "#genshin/module/private/main";
import { InputParameter, Order } from "@modules/command";
import { privateClass } from "#genshin/init";
import bot from "ROOT";

export async function main(
	{ sendMessage, messageData }: InputParameter
): Promise<void> {
	const userID: number = messageData.user_id;
	const info: string[] = messageData.raw_message.split( " " );
	
	const id: number = parseInt( info[0] );
	const newCookie: string = info.slice( 1 ).join( " " );
	
	const accounts: Private[] = privateClass.getUserPrivateList( userID );
	if ( accounts.length === 0 ) {
		await sendMessage( "你还未启用任何私人服务" );
		return;
	} else if ( id > accounts.length || id === 0 ) {
		const PRIVATE_LIST = <Order>bot.command.getSingle(
			"silvery-star.private-list", AuthLevel.User
		);
		const appendMsg = PRIVATE_LIST ? `，请使用 ${ PRIVATE_LIST.getHeaders()[0] } 检查` : "";
		await sendMessage( `无效的序号${ appendMsg }` );
		return;
	}
	const account: Private = accounts[id - 1];
	
	const reg: RegExp = /.*?ltuid=([0-9]+).*?/;
	const execRes: RegExpExecArray | null = reg.exec( newCookie );
	if ( !execRes || parseInt( execRes[1] ) !== account.setting.mysID ) {
		await sendMessage( "cookie 格式错误，或与原 cookie 对应的米游社账号不同" );
		return;
	}
	
	account.replaceCookie( newCookie );
	await sendMessage( `cookie 更新成功` );
}