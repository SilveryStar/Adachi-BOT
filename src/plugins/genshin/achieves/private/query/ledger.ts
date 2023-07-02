import { defineDirective } from "@/modules/command";
import { Private } from "#/genshin/module/private/main";
import { RenderResult } from "@/modules/renderer";
import { ledgerPromise } from "#/genshin/utils/promise";
import { getPrivateAccount } from "#/genshin/utils/private";
import { renderer } from "#/genshin/init";

function monthCheck( m: number ) {
	const optional: number[] = [];
	for ( let n = new Date().getMonth() + 1, i = 0; i < 3; i++ ) {
		optional.push( n );
		n = n - 1 <= 0 ? 12 : n - 1;
	}
	
	return m > 12 || m < 1 || !optional.includes( m );
}

export default defineDirective( "order", async ({ sendMessage, messageData, matchResult, auth, logger }) => {
	const userID: number = messageData.user_id;
	
	const [ idMsg, monthStr  ] = matchResult.match;
	
	/* 设置默认月份 */
	const month = Number.parseInt( monthStr ) || new Date().getMonth() + 1;
	
	if ( monthCheck( month ) ) {
		await sendMessage( `无法查询 ${ month } 月的札记数据` );
		return;
	}
	
	const info: Private | string = await getPrivateAccount( userID, idMsg, auth );
	if ( typeof info === "string" ) {
		await sendMessage( info );
		return;
	}
	
	const { cookie, uid, server } = info.setting;
	try {
		await ledgerPromise( uid, server, month, cookie );
	} catch ( error ) {
		if ( error !== "gotten" ) {
			await sendMessage( <string>error );
			return;
		}
	}
	
	const res: RenderResult = await renderer.asSegment( "/ledger", { uid } );
	if ( res.code === "ok" ) {
		await sendMessage( res.data );
	} else {
		logger.error( res.error );
		await sendMessage( "图片渲染异常，请联系持有者进行反馈" );
	}
} );