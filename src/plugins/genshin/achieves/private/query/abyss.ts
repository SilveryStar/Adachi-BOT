import { InputParameter, Order, SwitchMatchResult } from "@modules/command";
import { Private } from "#genshin/module/private/main";
import { Abyss } from "#genshin/types";
import { FakeMessage } from "oicq";
import { RenderResult } from "@modules/renderer";
import { getPrivateAccount } from "#genshin/utils/private";
import { getRegion } from "#genshin/utils/region";
import { abyssInfoPromise } from "#genshin/utils/promise";
import { renderer } from "#genshin/init";
import bot from "ROOT";

/* 回复深渊多图消息 */
async function forwardAchieves( abyss: Abyss, uid: string, userID: number, {
	client,
	redis,
	logger,
	config,
	messageData,
	sendMessage
}: InputParameter ) {
	const userInfo: string = `UID-${ uid }`;
	const floorList: number[] = [];
	
	floorList.push( 0 );
	await redis.setHash( `silvery-star.abyss-temp-${ userID }-${ 0 }`, {
		floor: 0,
		info: userInfo,
		revealRank: JSON.stringify( abyss.revealRank ),
		defeatRank: JSON.stringify( abyss.defeatRank ),
		takeDamageRank: JSON.stringify( abyss.takeDamageRank ),
		normalSkillRank: JSON.stringify( abyss.normalSkillRank ),
		energySkillRank: JSON.stringify( abyss.energySkillRank ),
		damageRank: JSON.stringify( abyss.damageRank ),
		maxFloor: abyss.maxFloor,
		totalBattleTimes: abyss.totalBattleTimes,
		totalStar: abyss.totalStar
	} );
	
	for ( let floorData of abyss.floors ) {
		const floor: number = floorData.index;
		const dbKey: string = `silvery-star.abyss-temp-${ userID }-${ floor }`;
		floorList.push( floor );
		await redis.setHash( dbKey, {
			floor,
			info: userInfo,
			data: JSON.stringify( floorData )
		} );
	}
	
	const content: FakeMessage[] = [];
	for ( let floor of floorList ) {
		const res: RenderResult = await renderer.asBase64(
			"/abyss.html", { qq: userID, floor }
		);
		if ( res.code === "error" ) {
			logger.error( res.error );
			continue;
		}
		const msgNode: FakeMessage = {
			user_id: config.number,
			message: {
				type: "image",
				data: { file: res.data }
			}
		};
		content.push( msgNode );
	}
	
	/* 是否为私聊消息 */
	const isPrivate = messageData.message_type === "private";
	
	const replyMessage = await client.makeForwardMsg( content, isPrivate );
	if ( replyMessage.status === "ok" ) {
		await sendMessage( replyMessage.data, false );
	} else {
		const CALL = <Order>bot.command.getSingle( "adachi.call", await bot.auth.get( userID ) );
		const appendMsg = CALL ? `私聊使用 ${ CALL.getHeaders()[0] } ` : "";
		await sendMessage( `转发消息生成错误，请${ appendMsg }联系持有者进行反馈` );
	}
}

/* 回复深渊单图消息 */
async function singleAchieves( abyss: Abyss, uid: string, userID: number, {
	redis,
	logger,
	sendMessage,
	messageData
}: InputParameter ) {
	await redis.setHash( `silvery-star.abyss-temp-${ userID }-single`, {
		uid,
		userName: messageData.sender.nickname,
		revealRank: JSON.stringify( abyss.revealRank ),
		defeatRank: JSON.stringify( abyss.defeatRank ),
		takeDamageRank: JSON.stringify( abyss.takeDamageRank ),
		normalSkillRank: JSON.stringify( abyss.normalSkillRank ),
		energySkillRank: JSON.stringify( abyss.energySkillRank ),
		damageRank: JSON.stringify( abyss.damageRank ),
		maxFloor: abyss.maxFloor,
		totalBattleTimes: abyss.totalBattleTimes,
		totalStar: abyss.totalStar,
		floors: JSON.stringify( abyss.floors )
	} );
	
	const res: RenderResult = await renderer.asCqCode(
		"/abyss-single.html", { qq: userID }
	);
	if ( res.code === "ok" ) {
		await sendMessage( res.data );
	} else {
		logger.error( res.error );
		const CALL = <Order>bot.command.getSingle( "adachi.call", await bot.auth.get( userID ) );
		const appendMsg = CALL ? `私聊使用 ${ CALL.getHeaders()[0] } ` : "";
		await sendMessage( `图片渲染异常，请${ appendMsg }联系持有者进行反馈` );
	}
}

export async function main( i: InputParameter ): Promise<void> {
	const { sendMessage, messageData, matchResult, auth, redis } = i;
	
	const match = <SwitchMatchResult>matchResult;
	const userID: number = messageData.user_id;
	
	// 是否一图流显示
	const isForwardMsg = match.match.includes( "-l" );
	
	const data: string = match.match.filter( m => m !== "-l" )[0] ?? "";
	
	const info: Private | string = await getPrivateAccount( userID, data, auth );
	if ( typeof info === "string" ) {
		await sendMessage( info );
		return;
	}
	
	const { uid, cookie } = info.setting;
	const server: string = getRegion( uid[0] );
	const period: number = match.isOn() ? 1 : 2;
	try {
		await redis.setString( `silvery-star.abyss-querying-${ userID }`, uid );
		await abyssInfoPromise( userID, server, period, cookie );
	} catch ( error ) {
		if ( error !== "gotten" ) {
			await sendMessage( <string>error );
			return;
		}
	}
	
	const abyssData: string = await redis.getString( `silvery-star.abyss-data-${ uid }` );
	
	if ( abyssData.length === 0 ) {
		await sendMessage( "查询错误" );
		return;
	}
	const abyss: Abyss = JSON.parse( abyssData );
	
	if ( !abyss.floors || abyss.floors.length === 0 ) {
		await sendMessage( "暂未查询到深渊数据" );
		return;
	}
	
	if ( isForwardMsg ) {
		await forwardAchieves( abyss, uid, userID, i );
	} else {
		await singleAchieves( abyss, uid, userID, i );
	}
}