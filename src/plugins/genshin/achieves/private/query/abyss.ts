import { InputParameter, SwitchMatchResult } from "@modules/command";
import { Private } from "#genshin/module/private/main";
import { Abyss } from "#genshin/types";
import { FakeMessage } from "oicq";
import { getPrivateAccount } from "#genshin/utils/private";
import { getRegion } from "#genshin/utils/region";
import { abyssInfoPromise } from "#genshin/utils/promise";
import { render } from "#genshin/utils/render";

export async function main(
	{ sendMessage, messageData, matchResult, auth, redis, config, client }: InputParameter
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
	let imageList: string[] = [];
	
	imageList[0] = await render( "abyss", {
		floor: -1,
		info: userInfo,
		data: Buffer.from( JSON.stringify( {
			revealRank: abyss.revealRank.splice( 0, 8 ),
			defeatRank: abyss.defeatRank.splice( 0, 3 ),
			takeDamageRank: abyss.takeDamageRank.splice( 0, 3 ),
			normalSkillRank: abyss.normalSkillRank.splice( 0, 3 ),
			energySkillRank: abyss.energySkillRank.splice( 0, 3 ),
			damageRank: abyss.damageRank,
			maxFloor: abyss.maxFloor,
			totalBattleTimes: abyss.totalBattleTimes,
			totalStar: abyss.totalStar
		} ) ).toString( "base64" )
	}, "#app", false );
	
	for ( let floorData of abyss.floors ) {
		const base64: string = Buffer.from( JSON.stringify( floorData ) )
			.toString( "base64" );
		const floor: number = floorData.index;
		
		imageList[floor] = await render( "abyss", {
			floor,
			info: userInfo,
			data: base64
		}, "#app", false );
	}
	
	imageList = imageList.filter( el => el !== undefined );
	const content: FakeMessage[] = [];
	for ( let image of imageList ) {
		content.push( {
			user_id: config.number,
			message: {
				type: "image",
				data: { file: image }
			}
		} );
	}
	
	const replyMessage = await client.makeForwardMsg( content );
	if ( replyMessage.status === "ok" ) {
		await sendMessage( replyMessage.data, false );
	} else {
		await sendMessage( "转发消息生成错误，请联系BOT主人进行错误反馈" );
	}
}