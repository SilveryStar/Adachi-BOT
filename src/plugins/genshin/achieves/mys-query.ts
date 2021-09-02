import { CommonMessageEventData as Message } from "oicq";
import { baseInfoPromise, characterInfoPromise, detailInfoPromise } from "../utils/promise";
import { Redis } from "../../../bot";
import { render } from "../utils/render";

async function getID( data: string, qqID: number ): Promise<number | string> {
	if ( data === "" ) {
		const mysID: string | null = await Redis.getString( `silvery-star.user-bind-id-${ qqID }` );
		return mysID === null ? "您还未绑定米游社通行证" : parseInt( mysID );
	} else if ( data.includes( "CQ:at" ) ) {
		const match = data.match( /\d+/g ) as string[];
		const atID: string = match[0];
		const mysID: string | null = await Redis.getString( `silvery-star.user-bind-id-${ atID }` );
		
		return mysID === null ? `用户 ${ atID } 未绑定米游社通行证` : parseInt( mysID );
	} else {
		return parseInt( data );
	}
}

async function main( sendMessage: ( content: string ) => any, message: Message ): Promise<void> {
	const data: string = message.raw_message;
	const qqID: number = message.user_id;
	const info: number | string = await getID( data, qqID );
	
	if ( typeof info === "string" ) {
		await sendMessage( info );
		return;
	}

	try {
		const baseInfo = await baseInfoPromise( qqID, info ) as [ number, string ];
		const detailInfo = await detailInfoPromise( qqID, ...baseInfo, true ) as number[];
		await characterInfoPromise( qqID, ...baseInfo, detailInfo );
	} catch ( error ) {
		if ( error !== "gotten" ) {
			await sendMessage( error as string );
			return;
		}
	}
	const image: string = await render( "card", { qq: qqID } )
	await sendMessage( image );
}

export { main }