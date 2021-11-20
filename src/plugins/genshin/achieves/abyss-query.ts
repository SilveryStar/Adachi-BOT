import { InputParameter, SwitchMatchResult } from "@modules/command";
import { FakeMessage } from "oicq";
import { Abyss } from "../types";
import Database from "@modules/database";
import { abyssInfoPromise, baseInfoPromise } from "../utils/promise";
import { getRegion } from "../utils/region";
import { render } from "../utils/render";

async function getBindData( id: string | null, userID: number ): Promise<string> {
	if ( id !== null ) {
		try {
			const server: string = await baseInfoPromise( userID, parseInt( id ) );
			return Promise.resolve( server );
		} catch ( error ) {
			return Promise.reject( <string>error );
		}
	}
	return Promise.reject( `用户 ${ userID } 未绑定米游社通行证` );
}

async function getUserInfo( data: string, userID: number, redis: Database ): Promise<[ number, string ] | string> {
	const queryingDB: string = `silvery-star.user-querying-id-${ userID }`;
	
	if ( data === undefined ) {
		const mysID: string | null = await redis.getString( `silvery-star.user-bind-id-${ userID }` );
		try {
			const server: string = await getBindData( mysID, userID );
			return [ parseInt( await redis.getString( queryingDB ) ), server ];
		} catch ( error ) {
			return error;
		}
	} else if ( data.includes( "CQ:at" ) ) {
		const match = <string[]>data.match( /\d+/g );
		const atID: string = match[0];
		const mysID: string | null = await redis.getString( `silvery-star.user-bind-id-${ atID }` );
		try {
			const server: string = await getBindData( mysID, parseInt( atID ) );
			return [ parseInt( await redis.getString( queryingDB ) ), server ];
		} catch ( error ) {
			return error;
		}
	} else {
		return [ parseInt( data ), getRegion( data[0] ) ];
	}
}

export async function main(
	{ sendMessage, messageData, redis, client, config, matchResult }: InputParameter
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
	const [ uid, server ]: [ number, string ] = info;

	try {
		await redis.setString( `silvery-star.abyss-querying-${ userID }`, uid );
		await abyssInfoPromise( userID, server, period );
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
