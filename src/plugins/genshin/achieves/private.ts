import { CommonMessageEventData as Message } from "oicq";
import { OrderMatch } from "../../../modules/command";
import { UserInfo } from "../module/private";
import { sendType } from "../../../modules/message";
import { ErrorMsg } from "../utils/promise";
import * as ApiType from "../types";
import { AuthLevel, getAuthLevel } from "../../../modules/auth";
import { getHeader as h, existHeader as e } from "../utils/header";
import { scheduleJob } from "node-schedule";
import { pull } from "lodash";
import { getBaseInfo } from "../utils/api";
import { privateClass } from "../init";

/* 临时存储用户输入的 cookie，若用户不确认则 3min 后清除 */
const tempSubscriptionList: number[] = [];

function subscribe( qqID: number, s: sendType, a: AuthLevel ): string {
	if ( tempSubscriptionList.includes( qqID ) ) {
		return "您已经处于私人服务申请状态";
	}
	
	tempSubscriptionList.push( qqID );
	
	const d = new Date();
	scheduleJob( d.setMinutes( d.getMinutes() + 3 ), async () => {
		const isFinish: number | undefined = tempSubscriptionList.find( el => el === qqID );
		
		if ( isFinish !== undefined ) {
			pull( tempSubscriptionList, qqID );
			await s( "私人服务申请超时，BOT 自动取消" );
		}
	} );
	
	return "这是一条提醒，请确保你非常明确你在做什么\n" +
		   "如果要开启私人服务功能，必须提供你的米游社 cookie\n" +
		   "这可能会导致你的账号出现安全风险，请务必确保 BOT 持有者可信\n" +
		   `如果确定开启该功能，使用「${ h( "silvery-star.private-confirm", a )[0] }+cookie」来继续\n` +
		   "你可以在 https://ddl.ink/acookie 中查看获取 cookie 的方法\n" +
		   "这需要在 3 分钟内进行，此后将会自动取消本次申请";
}

async function confirm( qqID: number, cookie: string, a: AuthLevel ): Promise<string> {
	if ( !tempSubscriptionList.some( el => el === qqID ) ) {
		return `你还未申请私人服务，请先使用「${ h( "silvery-star.private-subscribe", a )[0] }」`;
	}
	
	const reg = new RegExp( /.*?ltuid=([0-9]+).*?/g );
	const execRes: RegExpExecArray | null = reg.exec( cookie );
	
	if ( execRes === null ) {
		return "无效的 cookie，请重新提交正确的 cookie";
	}
	
	const mysID: number = parseInt( execRes[1] );
	const { retcode, message, data } = await getBaseInfo( mysID, cookie );

	if ( !ApiType.isBBS( data ) ) {
		return ErrorMsg.UNKNOWN;
	} else if ( retcode !== 0 ) {
		return ErrorMsg.FORM_MESSAGE + message;
	} else if ( !data.list || data.list.length === 0 ) {
		return ErrorMsg.NOT_FOUND;
	}
	
	const genshinInfo: ApiType.Game | undefined = data.list.find( el => el.gameId === 2 );
	if ( !genshinInfo ) {
		return ErrorMsg.NOT_FOUND;
	}
	
	const uid: string = genshinInfo.gameRoleId;
	pull( tempSubscriptionList, qqID );
	return await privateClass.addPrivate( uid, cookie, qqID );
}

async function getPrivateList( qqID: number ): Promise<string> {
	const settings: UserInfo[] = privateClass.getUserInfoList( qqID );
	if ( settings.length === 0 ) {
		return "你还未启用任何私人服务";
	}
	
	const s: string[] = [];
	const num: number = settings.length;
	for ( let i = 0; i < num; i++ ) {
		const uid: string = settings[i].uid;
		s.push( `${ i + 1 }. UID${ uid }` );
	}
	
	return "当前启用私人服务的账号：" + [ "", ...s ].join( "\n  " );
}

async function cancelPrivate( qqID: number, id: string ): Promise<string> {
	const settings: UserInfo[] = privateClass.getUserInfoList( qqID );
	if ( settings.length === 0 ) {
		return "你还未启用任何私人服务";
	}
	
	return privateClass.delPrivate( qqID, parseInt( id ) );
}

async function main( sendMessage: sendType, message: Message, match: OrderMatch ): Promise<void> {
	const qqID: number = message.user_id;
	const data: string = message.raw_message;
	let respMsg: string;
	
	const header = match.header as string;
	const auth: AuthLevel = await getAuthLevel( qqID );
	switch ( true ) {
		/* 触发订阅事件 */
		case e( header, "silvery-star.private-subscribe", auth ):
			respMsg = subscribe( qqID, sendMessage, auth );
			break;
		/* 确认订阅 */
		case e( header, "silvery-star.private-confirm", auth ):
			respMsg = await confirm( qqID, data, auth );
			break;
		/* 删除私人服务 */
		case e( header, "silvery-star.cancel-private", auth ):
			respMsg = await cancelPrivate( qqID, data );
			break;
		/* 获取所有私人服务 */
		case e( header, "silvery-star.private-list", auth ):
			respMsg = await getPrivateList( qqID );
			break;
		default:
			respMsg = ErrorMsg.UNKNOWN;
	}
	
	await sendMessage( respMsg );
}

export { main }