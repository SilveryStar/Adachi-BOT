import { defineDirective } from "@/modules/command";
import { privateClass } from "#/genshin/init";
import { checkMysCookieInvalid } from "#/genshin/utils/cookie";

const tempSubscriptionList: number[] = [];

function subscribe(): string {
	return "这是一条提醒，请确保你非常明确你在做什么\n" +
		"如果要开启私人服务功能，必须提供你的米游社 cookie\n" +
		"这可能会导致你的账号出现安全风险，请务必确保 BOT 持有者可信\n" +
		`如果确定开启该功能，发送「cookie」来继续\n` +
		"你可以在 https://docs.adachi.top/faq 中查看获取 cookie 的方法\n" +
		"这需要在 3 分钟内进行，此后将会自动取消本次申请";
}

async function confirm( userID: number, rawCookie: string ): Promise<string> {
	/* 对Cookie进行简化保留 */
	const { uid, cookie, stoken } = await checkMysCookieInvalid( rawCookie );
	return await privateClass.addPrivate( uid, cookie, userID, stoken );
}

export default defineDirective( "enquire", async ( { sendMessage, messageData, matchResult, auth, command } ) => {
	const userID = messageData.user_id;
	
	if ( matchResult.status === "activate" ) {
		const msg: string = subscribe();
		await sendMessage( msg );
	}
	
	if ( matchResult.status === "confirm" ) {
		const data = messageData.raw_message;
		try {
			const msg: string = await confirm( userID, data );
			await sendMessage( msg );
		} catch ( error: any ) {
			if ( typeof error === "string" ) {
				await sendMessage( error );
				return false;
			}
			throw error;
		}
	}
	
	if ( matchResult.status === "timeout" ) {
		await sendMessage( "私人服务申请超时，BOT 自动取消" )
	}
} );
