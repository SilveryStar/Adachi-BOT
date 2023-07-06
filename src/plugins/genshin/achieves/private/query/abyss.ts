import { defineDirective, InputParameter } from "@/modules/command";
import { Private } from "#/genshin/module/private/main";
import { Abyss } from "#/genshin/types";
import { segment, ForwardElem } from "@/modules/lib";
import { RenderResult } from "@/modules/renderer";
import { getPrivateAccount } from "#/genshin/utils/private";
import { getRegion } from "#/genshin/utils/region";
import { abyssInfoPromise } from "#/genshin/utils/promise";
import { renderer } from "#/genshin/init";

/* 回复深渊多图消息 */
async function forwardAchieves( abyss: Abyss, uid: string, userID: number, {
	client,
	redis,
	logger,
	sendMessage
}: InputParameter<"switch"> ) {
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
	
	const content: ForwardElem = {
		type: "forward",
		messages: []
	};
	for ( let floor of floorList ) {
		const res: RenderResult = await renderer.asBase64(
			"/abyss", { qq: userID, floor }
		);
		if ( res.code === "error" ) {
			logger.error( res.error );
			continue;
		}
		content.messages.push( {
			uin: client.uin,
			content: segment.image( <string>res.data )
		} );
	}
	
	await sendMessage( content, false );
}

/* 回复深渊单图消息 */
async function singleAchieves( abyss: Abyss, uid: string, userID: number, {
	redis,
	logger,
	sendMessage,
	messageData
}: InputParameter<"switch"> ) {
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
	
	const res: RenderResult = await renderer.asSegment(
		"/abyss-single", { qq: userID }
	);
	if ( res.code === "ok" ) {
		await sendMessage( res.data );
	} else {
		throw new Error( res.error );
	}
}

export default defineDirective( "switch", async ( i ) => {
	const { sendMessage, messageData, matchResult, auth, redis } = i;
	
	const userID: number = messageData.user_id;
	
	// 是否一图流显示
	const isForwardMsg = matchResult.match.includes( "-l" );
	
	const data: string = matchResult.match.filter( m => m !== "-l" )[0] ?? "";
	
	const info: Private | string = await getPrivateAccount( userID, data, auth );
	if ( typeof info === "string" ) {
		await sendMessage( info );
		return;
	}
	
	const { uid, cookie } = info.setting;
	const server: string = getRegion( uid[0] );
	const period: number = matchResult.isOn() ? 1 : 2;
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
} );