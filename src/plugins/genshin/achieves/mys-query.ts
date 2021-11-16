import { InputParameter } from "@modules/command";
import Database from "@modules/database";
import { baseInfoPromise, characterInfoPromise, detailInfoPromise } from "../utils/promise";
import { render } from "../utils/render";
import { config } from "../init";

async function getID( data: string, userID: number, redis: Database ): Promise<number | string> {
	if ( data === "" ) {
		const mysID: string | null = await redis.getString( `silvery-star.user-bind-id-${ userID }` );
		return mysID === null ? "您还未绑定米游社通行证" : parseInt( mysID );
	} else if ( data.includes( "CQ:at" ) ) {
		const match = <string[]>data.match( /\d+/g );
		const atID: string = match[0];
		const mysID: string | null = await redis.getString( `silvery-star.user-bind-id-${ atID }` );
		
		return mysID === null ? `用户 ${ atID } 未绑定米游社通行证` : parseInt( mysID );
	} else {
		return parseInt( data );
	}
}

export async function main( { sendMessage, messageData, redis, logger }: InputParameter ): Promise<void> {
	const data: string = messageData.raw_message;
	const userID: number = messageData.user_id;
	const info: number | string = await getID( data, userID, redis );
	
	if ( typeof info === "string" ) {
		await sendMessage( info );
		return;
	}

	try {
		const baseInfo = <[ number, string ]>await baseInfoPromise( userID, info, redis );
		const detailInfo = <number[]>await detailInfoPromise( userID, ...baseInfo, true, logger, redis );
		await characterInfoPromise( userID, ...baseInfo, detailInfo, redis );
	} catch ( error ) {
		if ( error !== "gotten" ) {
			await sendMessage( <string>error );
			return;
		}
	}
	const image: string = await render(
		"card",
		{ qq: userID, style: config.cardWeaponStyle }
	);
	await sendMessage( image );
}