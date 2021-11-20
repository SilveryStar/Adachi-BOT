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
	{ sendMessage, messageData, redis }: InputParameter
): Promise<void> {
	const data: string = messageData.raw_message;
	const userID: number = messageData.user_id;
	const info: [ number, string ] | string = getUserInfo( data );
	
	if ( typeof info === "string" ) {
		await sendMessage( info );
		return;
	}
	
	try {
		const [ uid, server ]: [ number, string ] = info;
		await redis.setHash( `silvery-star.card-data-${ uid }`, {
			nickname: messageData.sender.nickname,
			level: 0, uid
		} );
		await redis.setString( `silvery-star.user-querying-id-${ userID }`, uid );
		
		const detailInfo = <number[]>await detailInfoPromise( userID, server );
		await characterInfoPromise( userID, server, detailInfo );
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