import { InputParameter } from "@modules/command";
import { characterInfoPromise, detailInfoPromise } from "../utils/promise";
import { render } from "../utils/render";
import { getRegion } from "../utils/region";
import { config } from "#genshin/init";

function getUserInfo( data: string ): [ number, string ] | string {
	const reg = new RegExp( /^[125][0-9]{8}$/g );
	if ( !reg.test( data ) ) {
		return "输入 UID 不合法";
	}
	const uid: number = parseInt( data );
	const region: string = getRegion( data[0] );
	
	return [ uid, region ];
}

export async function main(
	{ sendMessage, messageData, redis, logger }: InputParameter
): Promise<void> {
	const data: string = messageData.raw_message;
	const qqID: number = messageData.user_id;
	const info: [ number, string ] | string = getUserInfo( data );
	
	if ( typeof info === "string" ) {
		await sendMessage( info );
		return;
	}
	
	try {
		await redis.setHash( `silvery-star.card-data-${ qqID }`, {
			nickname: messageData.sender.nickname,
			uid: info[0],
			level: 0
		} );
		const detailInfo = <number[]>await detailInfoPromise( qqID, ...info, false, logger, redis );
		await characterInfoPromise( qqID, ...info, detailInfo, redis );
	} catch ( error ) {
		if ( error !== "gotten" ) {
			await sendMessage( <string>error );
			return;
		}
	}
	const image: string = await render(
		"card",
		{ qq: qqID, style: config.cardWeaponStyle }
	);
	await sendMessage( image );
}