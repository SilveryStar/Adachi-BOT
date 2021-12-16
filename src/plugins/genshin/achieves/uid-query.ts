import Database from "@modules/database";
import { InputParameter } from "@modules/command";
import { RenderResult } from "@modules/renderer";
import { characterInfoPromise, detailInfoPromise } from "../utils/promise";
import { getRegion } from "../utils/region";
import { renderer } from "#genshin/init";

async function getUID( data: string, userID: number, redis: Database ): Promise<number | string> {
	if ( data === "" ) {
		const uid: string = await redis.getString( `silvery-star.user-bind-uid-${ userID }` );
		return uid.length === 0 ? "您还未绑定游戏UID" : parseInt( uid );
	} else if ( data.includes( "cq:at" ) ) {
		const match = <string[]>data.match( /\d+/g );
		const atID: string = match[0];
		const uid: string = await redis.getString( `silvery-star.user-bind-uid-${ atID }` );
		
		return uid.length === 0 ? `用户 ${ atID } 未绑定游戏UID` : parseInt( uid );
	} else {
		return parseInt( data );
	}
}

export async function main(
	{ sendMessage, messageData, redis, logger }: InputParameter
): Promise<void> {
	const data: string = messageData.raw_message;
	const userID: number = messageData.user_id;
	
	const info: string | number = await getUID( data, userID, redis );
	if ( typeof info === "string" ) {
		await sendMessage( info );
		return;
	}
	
	const uid: number = info;
	const server: string = getRegion( uid.toString()[0] );
	
	try {
		await redis.setHash( `silvery-star.card-data-${ uid }`, {
			nickname: messageData.sender.nickname,
			level: 0, uid
		} );
		await redis.setString( `silvery-star.user-querying-id-${ userID }`, uid );
		
		const charIDs = <number[]>await detailInfoPromise( userID, server );
		await characterInfoPromise( userID, server, charIDs );
	} catch ( error ) {
		if ( error !== "gotten" ) {
			await sendMessage( <string>error );
			return;
		}
	}
	
	const res: RenderResult = await renderer.asCqCode(
		"/user-base.html",
		{ qq: userID }
	);
	if ( res.code === "ok" ) {
		await sendMessage( res.data );
	} else {
		logger.error( res.error );
		await sendMessage( "图片渲染异常，请联系持有者进行反馈" );
	}
}