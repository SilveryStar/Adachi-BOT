import { InputParameter } from "@modules/command";
import { NameResult, getRealName } from "../utils/name";
import { singleCharacterInfoPromise } from "../utils/promise";
import { render } from "../utils/render";
import { characterID } from "#genshin/init";
import { getRegion } from "#genshin/utils/region";

export async function main(
	{ sendMessage, messageData, redis }: InputParameter
): Promise<void> {
	const userID: number = messageData.user_id;
	const info: string[] = messageData.raw_message.split( " " );
	
	let uid: string, name: string;
	if ( info.length === 1 ) {
		/* 处理 UID 和 名称 间不加空格的操作 */
		if ( /\d{9}/.test( info[0] ) ) {
			uid = info[0].substring( 0, 9 );
			name = info[0].substr( 9 );
		} else {
			uid = await redis.getString( `silvery-star.user-bind-uid-${ userID }` );
			if ( uid.length === 0 ) {
				await sendMessage( "你还未绑定游戏UID" );
				return;
			}
			name = info[0];
		}
	} else if ( info.length === 2 ) {
		[ uid, name ] = info;
	} else {
		await sendMessage( "指令格式错误" );
		return;
	}
	if ( name.length === 0 ) {
		await sendMessage( "未输入角色名称" );
		return;
	}
	
	const result: NameResult = getRealName( name );
	if ( !result.definite ) {
		const message: string = result.info.length === 0
			? "查询失败，请检查角色名称是否正确"
			: `未找到相关信息，是否要找：${ [ "", ...<string[]>result.info ].join( "\n  - " ) }`;
		await sendMessage( message );
		return;
	}
	const realName: string = <string>result.info;
	
	const charID: number = characterID.map[realName];
	const server: string = getRegion( uid[0] );
	
	try {
		const data = await singleCharacterInfoPromise( parseInt( uid ), server, charID );
		const image: string = await render( "character", {
			data: Buffer.from( JSON.stringify( data ) ).toString( "base64" )
		} );
		await sendMessage( image );
	} catch ( error ) {
		await sendMessage( <string>error );
	}
}