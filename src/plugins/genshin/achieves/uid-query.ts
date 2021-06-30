import { GroupMessageEventData, PrivateMessageEventData } from "oicq";
import { characterInfoPromise, detailInfoPromise } from "../utils/promise";
import { Redis } from "../../../bot";
import { render } from "../utils/render";

function getID( data: string ): [ number, string ] | string {
	if ( data.length !== 9 || ( data[0] !== "1" && data[0] !== "5" ) ) {
		return "输入 UID 不合法";
	}
	const uid: number = parseInt( data );
	const region: string = data[0] === "1" ? "cn_gf01" : "cn_qd01";
	
	return [ uid, region ];
}

type Message = GroupMessageEventData | PrivateMessageEventData;

async function main( sendMessage: ( content: string ) => any, message: Message ): Promise<void> {
	const data: string = message.raw_message;
	const qqID: number = message.user_id;
	const info: [ number, string ] | string = getID( data );
	
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
			await sendMessage( error );
			return;
		}
	}
	const image: string = await render( "card", { qq: qqID } );
	await sendMessage( image );
}

export { main }