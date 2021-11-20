import { InputParameter } from "@modules/command";
import { NameResult, getRealName } from "../utils/name";
import { baseInfoPromise, characterInfoPromise, detailInfoPromise } from "../utils/promise";
import { render } from "../utils/render";

export async function main(
	{ sendMessage, messageData, redis }: InputParameter
): Promise<void> {
	const userID: number = messageData.user_id;
	const name: string = messageData.raw_message;
	
	/* 若用户在一小时内存在查询操作，则使用上一次操作的数据缓存 */
	const uid: string = await redis.getString( `silvery-star.user-querying-id-${ userID }` );
	if ( uid.length === 0 ) {
		await sendMessage( "你还未绑定米游社" )
	}
	let data: any = await redis.getHash( `silvery-star.card-data-${ uid }` );
	
	/* 若无数据缓存，则尝试获取用户绑定的通行证，并通过其获取数据 */
	if ( data === null ) {
		const mysID: string | null = await redis.getString( `silvery-star.user-bind-id-${ userID }` );
		if ( mysID !== null ) {
			try {
				const server = <string>await baseInfoPromise( userID, parseInt( mysID ) );
				const detailInfo = <number[]>await detailInfoPromise( userID, server );
				await characterInfoPromise( userID, server, detailInfo );
			} catch ( error ) {
				await sendMessage( <string>error );
				return;
			}
			data = await redis.getHash( `silvery-star.card-data-${ uid }` );
		} else {
			await sendMessage( "请先通过通行证或UID查询自己的游戏信息" );
			return;
		}
	}
	
	if ( data.avatars.length === 0 ) {
		await sendMessage( "数据查询出错" );
		return;
	}
	data = JSON.parse( data.avatars );
	
	const result: NameResult = getRealName( name );
	if ( !result.definite || !data.some( el => el.name === result.info ) ) {
		await sendMessage( "查询失败，请检查角色名称是否正确或该用户是否拥有该角色" );
		return;
	}
	const image: string = await render(
		"character",
		{ qq: userID, name: result.info }
	);
	await sendMessage( image );
}