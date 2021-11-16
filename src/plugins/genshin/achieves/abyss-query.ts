import { InputParameter, SwitchMatchResult } from "@modules/command";
import { FakeMessage } from "oicq";
import { Abyss } from "../types";
import Database from "@modules/database";
import { abyssInfoPromise, baseInfoPromise } from "../utils/promise";
import { getRegion } from "../utils/region";
import { render } from "../utils/render";

async function getBindData(
	id: string | null, userID: number,
	redis: Database
): Promise<[ number, string ] | string> {
	if ( id !== null ) {
		try {
			return <[ number, string ]>await baseInfoPromise( userID, parseInt( id ), redis );
		} catch ( error ) {
			return <string>error;
		}
	}
	return `用户 ${ userID } 未绑定米游社通行证`;
}

async function getUserInfo( data: string, userID: number, redis: Database ): Promise<[ number, string ] | string> {
	if ( data === undefined ) {
		const mysID: string | null = await redis.getString( `silvery-star.user-bind-id-${ userID }` );
		return await getBindData( mysID, userID, redis );
	} else if ( data.includes( "CQ:at" ) ) {
		const match = <string[]>data.match( /\d+/g );
		const atID: string = match[0];
		const mysID: string | null = await redis.getString( `silvery-star.user-bind-id-${ atID }` );
		return await getBindData( mysID, parseInt( atID ), redis );
	} else {
		return [ parseInt( data ), getRegion( data[0] ) ];
	}
}

export async function main(
	{ sendMessage, messageData, redis, client, config, logger, matchResult }: InputParameter
): Promise<void> {
	const match = <SwitchMatchResult>matchResult;
	const [ data ] = match.match;
	
	const userID: number = messageData.user_id;
	const info: [ number, string ] | string = await getUserInfo( data, userID, redis );
	const period: number = match.isOn() ? 1 : 2;

	if ( typeof info === "string" ) {
		await sendMessage( info );
		return;
	}

	try {
		await abyssInfoPromise( userID, ...info, period, logger, redis );
	} catch ( error ) {
		if ( error !== "gotten" ) {
			await sendMessage( <string>error );
			return;
		}
	}

	const [ uid ]: [ number, string ] = info;
	const abyss: Abyss = JSON.parse( <string>await redis.getString( `silvery-star.abyss-data-${ userID }` ));

	const userInfo: string = `${ messageData.sender.nickname }|${ uid }`
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
	}
}
