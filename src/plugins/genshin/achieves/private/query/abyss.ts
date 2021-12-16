import { InputParameter, SwitchMatchResult } from "@modules/command";
import { Private } from "#genshin/module/private/main";
import { Abyss } from "#genshin/types";
import { FakeMessage } from "oicq";
import { RenderResult } from "@modules/renderer";
import { getPrivateAccount } from "#genshin/utils/private";
import { getRegion } from "#genshin/utils/region";
import { abyssInfoPromise } from "#genshin/utils/promise";
import { renderer } from "#genshin/init";

export async function main(
	{ sendMessage, messageData, matchResult, auth, redis, config, client, logger }: InputParameter
): Promise<void> {
	const match = <SwitchMatchResult>matchResult;
	const userID: number = messageData.user_id;
	const data: string = !match.match[0] ? "" : match.match[0];
	
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
	
	const userInfo: string = `UID-${ uid }`;
	const floorList: number[] = [];
	
	function getDataPair( key: string, max: number ): Record<string, string> {
		return { [key]: JSON.stringify( abyss[key].splice( 0, max ) ) };
	}
	
	floorList.push( 0 );
	await redis.setHash( `silvery-star.abyss-temp-${ userID }-${ 0 }`, {
		floor: 0,
		info: userInfo,
		...getDataPair( "revealRank", 8 ),
		...getDataPair( "defeatRank", 3 ),
		...getDataPair( "takeDamageRank", 3 ),
		...getDataPair( "normalSkillRank", 3 ),
		...getDataPair( "energySkillRank", 3 ),
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
	
	const replyMessage = await client.makeForwardMsg( content );
	if ( replyMessage.status === "ok" ) {
		await sendMessage( replyMessage.data, false );
	} else {
		await sendMessage( "转发消息生成错误，请联系BOT主人进行错误反馈" );
	}
}