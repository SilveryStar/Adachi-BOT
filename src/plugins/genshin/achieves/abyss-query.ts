import { Redis } from "../../../bot";
import { CommonMessageEventData as Message } from "oicq";
import { spiralAbyssInfoPromise, baseInfoPromise } from "../utils/promise";
import { render } from "../utils/render";

async function getID( identityString: string, qqID: number ): Promise<[ number, string ] | string> {
	if ( identityString === undefined ) {
		// retrieve informations using Owner qqID.
		const mysID: string | null = await Redis.getString( `silvery-star.user-bind-id-${ qqID }` );
		if ( mysID === null )
			return "您还未绑定米游社通行证";
		return baseInfoPromise( qqID, parseInt( mysID ) );
	} else if ( identityString.includes( "CQ:at" ) ) {
		// retrieve informations using qqID of the one @ by.
		const match = identityString.match( /\d+/g ) as string[];
		const atID: string = match[0];
		const mysID: string | null = await Redis.getString( `silvery-star.user-bind-id-${ atID }` );
		if ( mysID === null )
			return "您还未绑定米游社通行证";
		return baseInfoPromise( qqID, parseInt( mysID ) );
	}
	
	// retrieve informations using given UID.
	if ( identityString.length !== 9 || ( identityString[0] !== "1" && identityString[0] !== "5" ) ) {
		return "输入 UID 不合法";
	}
	const uid: number = parseInt( identityString );
	const region: string = identityString[0] === "1" ? "cn_gf01" : "cn_qd01";
	
	return [ uid, region ];
}


async function main( sendMessage: ( content: string ) => any, message: Message ): Promise<void> {
	// The regexp below should keep the same as the one used when registering the plugin.
	//     First capture group is either an UID or a [CQ:at] code (possibly empty).
	//     Second is a string "last" (possibly empty).
	const reg: RegExp = / *(\[CQ:at,qq=[0-9]+.*\]|[0-9]{9})? *(last)?$/;
	const result: RegExpMatchArray | null = message.raw_message.match( reg );
	if ( result === null )
		return;
	
	const identityString: string = result[1];
	const queryPeriod: string = (result[2] !== undefined) ? "previous" : "current";
	//const queryLast: boolean = result[2] !== undefined;
	const qqID: number = message.user_id;
	const info: [ number, string ] | string = await getID( identityString, qqID );
	
	if ( typeof info === "string" ) {
		await sendMessage( info );
		return;
	}
	
	try {
		await spiralAbyssInfoPromise( queryPeriod, ...info, true );
	} catch ( error ) {
		if ( error !== "gotten" ) {
			await sendMessage( error );
			return;
		}
	}
	
	const abyssData = await Redis.getHash( `kernel-bin.abyss-data-${ info[0] }` );
	
	if ( JSON.parse( abyssData[queryPeriod] ).floors.length === 0 ) {
		await sendMessage( `未查询到深渊数据` );
		return;
	}
	
	const image: string = await render( "abyss", { uid: info[0], period: queryPeriod } );
	await sendMessage( image );
}

export { main }
