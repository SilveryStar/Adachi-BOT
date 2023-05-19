import { InputParameter, Order, OrderMatchResult } from "@/modules/command";
import { AuthLevel } from "@/modules/management/auth";
import { SendFunc } from "@/modules/message";
import { scheduleJob } from "node-schedule";
import { pull } from "lodash";
import { privateClass } from "#/genshin/init";
import { checkMysCookieInvalid } from "#/genshin/utils/cookie";

const tempSubscriptionList: number[] = [];

function subscribe( userID: number, send: SendFunc, a: AuthLevel, CONFIRM: Order ): string {
	if ( tempSubscriptionList.includes( userID ) ) {
		return "您已经处于私人服务申请状态";
	}
	
	tempSubscriptionList.push( userID );
	
	const d = new Date();
	scheduleJob( d.setMinutes( d.getMinutes() + 3 ), async () => {
		const isFinish: number | undefined = tempSubscriptionList.find( el => el === userID );
		
		if ( isFinish !== undefined ) {
			pull( tempSubscriptionList, userID );
			await send( "私人服务申请超时，BOT 自动取消" );
		}
	} );
	
	return "这是一条提醒，请确保你非常明确你在做什么\n" +
		"如果要开启私人服务功能，必须提供你的米游社 cookie\n" +
		"这可能会导致你的账号出现安全风险，请务必确保 BOT 持有者可信\n" +
		`如果确定开启该功能，使用「${ CONFIRM.getHeaders()[0] }+cookie」来继续\n` +
		"你可以在 https://docs.adachi.top/faq 中查看获取 cookie 的方法\n" +
		"这需要在 3 分钟内进行，此后将会自动取消本次申请";
}

async function confirm(
	userID: number, rawCookie: string,
	a: AuthLevel, SUBSCRIBE: Order
): Promise<string> {
	if ( !tempSubscriptionList.some( el => el === userID ) ) {
		return `你还未申请私人服务，请先使用「${ SUBSCRIBE.getHeaders()[0] }」`;
	}
	try {
		/* 对Cookie进行简化保留 */
		const { uid, cookie, stoken } = await checkMysCookieInvalid( rawCookie );
		pull( tempSubscriptionList, userID );
		return await privateClass.addPrivate( uid, cookie, userID, stoken );
	} catch ( error: any ) {
		if ( typeof error === "string" ) {
			return error;
		}
		throw error;
	}
}

export async function main(
	{ sendMessage, messageData, matchResult, auth, command }: InputParameter
): Promise<void> {
	const userID: number = messageData.user_id;
	const data: string = messageData.raw_message;
	
	const header = ( <OrderMatchResult>matchResult ).header;
	const a: AuthLevel = await auth.get( userID );
	
	const CONFIRM = <Order>command.getSingle( "silvery-star.private-confirm", a );
	const SUBSCRIBE = <Order>command.getSingle( "silvery-star.private-subscribe", a );
	
	if ( !CONFIRM || !SUBSCRIBE ) {
		await sendMessage( "BOT 持有者已关闭私人服务订阅功能" );
	}
	
	if ( SUBSCRIBE.getHeaders().includes( header ) ) {
		const msg: string = subscribe( userID, sendMessage, a, CONFIRM );
		await sendMessage( msg );
	} else if ( CONFIRM.getHeaders().includes( header ) ) {
		const msg: string = await confirm( userID, data, a, SUBSCRIBE );
		await sendMessage( msg );
	}
}
