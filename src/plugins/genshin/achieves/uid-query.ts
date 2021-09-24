import { GroupMessageEventData, PrivateMessageEventData } from "oicq";
import { characterInfoPromise, detailInfoPromise } from "../utils/promise";
import { render } from "../utils/render";
import { getRegion } from "../utils/region";
import { Redis } from "../../../bot";

function getUserInfo( data: string ): [ number, string ] | string {
	const reg = new RegExp( /^[125][0-9]{8}$/g );
	if ( !reg.test( data ) ) {
		return "输入 UID 不合法";
	}
	const uid: number = parseInt( data );
	const region: string = getRegion( data[0] );
	
	return [ uid, region ];
}

type Message = GroupMessageEventData | PrivateMessageEventData;

async function main( sendMessage: ( content: string ) => any, message: Message ): Promise<void> {
	const data: string = message.raw_message;
	const qqID: number = message.user_id;
	const info: [ number, string ] | string = getUserInfo( data );
	
	if ( typeof info === "string" ) {
		await sendMessage( info );
		return;
	}
	
	try {
		await Redis.setHash( `silvery-star.card-data-${ qqID }`, {
			nickname: message.sender.nickname,
			uid: info[0],
			level: 0
		} );
		const detailInfo = await detailInfoPromise( qqID, ...info, false ) as number[]
		await characterInfoPromise( qqID, ...info, detailInfo );
	} catch ( error ) {
		if ( error !== "gotten" ) {
			await sendMessage( error as string );
			return;
		}
	}
	const image: string = await render( "card", { qq: qqID } );
	await sendMessage( image );
}

export { main }