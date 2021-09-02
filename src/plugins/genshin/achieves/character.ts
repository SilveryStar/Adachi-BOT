import { CommonMessageEventData as Message } from "oicq";
import { Redis } from "../../../bot";
import { baseInfoPromise, characterInfoPromise, detailInfoPromise } from "../utils/promise";
import { render } from "../utils/render";

async function main( sendMessage: ( content: string ) => any, message: Message ): Promise<void> {
	const qqID: number = message.user_id;
	const name: string = message.raw_message;

	let data: any = await Redis.getHash( `silvery-star.card-data-${ qqID }` );
	const mysID: string | null = await Redis.getString( `silvery-star.user-bind-id-${ qqID }` );
	
	if ( data === null ) {
		if ( mysID !== null ) {
			try {
				const baseInfo = await baseInfoPromise( qqID, parseInt( mysID ) ) as [ number, string ];
				const detailInfo = await detailInfoPromise( qqID, ...baseInfo, true ) as number[];
				await characterInfoPromise( qqID, ...baseInfo, detailInfo );
			} catch ( error ) {
				await sendMessage( error as string );
				return;
			}
			data = await Redis.getHash( `silvery-star.card-data-${ qqID }` );
		} else {
			await sendMessage( "请先通过通行证或UID查询自己的游戏信息" );
			return;
		}
	}
	data = JSON.parse( data.avatars );
	
	if ( !data.find( el => el.name === name ) ) {
		await sendMessage( "查询失败，请检查角色名称是否正确或该用户是否拥有该角色" );
		return;
	}
	const image: string = await render( "character", { qq: qqID, name } );
	await sendMessage( image );
}

export { main }