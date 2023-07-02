import { defineDirective } from "@/modules/command/main";

export default defineDirective( "order", async ( { sendMessage, messageData, message, matchResult, redis, config } ) => {
	const user = messageData.user_id;
	const content = matchResult.match[0];
	
	const noSupportMsg = messageData.message.find( m => ![ "text", "image" ].includes( m.type ) )
	if ( noSupportMsg ) {
		await sendMessage( "仅允许发送包含文字/图片的内容" );
		return;
	}
	
	const dbKey = `adachi.call-limit-${ user }`;
	let limit: number = parseInt( await redis.getString( dbKey ) );
	
	if ( limit <= 0 ) {
		await sendMessage( "今日反馈次数已用尽" )
		return;
	}
	
	if ( isNaN( limit ) ) {
		limit = config.directive.callTimes;
	}
	
	limit = ( isNaN( limit ) ? config.directive.callTimes : limit ) - 1;
	
	await message.sendMaster( `来自用户「${ user }」：${ content }` );
	await sendMessage( `发送成功，今日剩余反馈次数：${ limit }` );
	
	const setData = { user, content, date: new Date().getTime() };
	await redis.addListElement( "adachi.call-list", JSON.stringify( setData ) );
	
	/* 获取过期时间 */
	const todayEndTime = new Date( new Date().toLocaleDateString() ).getTime() + 24 * 60 * 60 * 1000;
	const keyTimeOut = Math.ceil( ( todayEndTime - new Date().getTime() ) / 1000 );
	
	await redis.setString( dbKey, limit );
	await redis.setTimeout( dbKey, keyTimeOut );
} );