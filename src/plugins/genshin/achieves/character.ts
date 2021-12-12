import bot from "ROOT";
import { InputParameter, Order } from "@modules/command";
import { Private } from "#genshin/module/private/main";
import { AuthLevel } from "@modules/management/auth";
import { Artifact } from "#genshin/types/character";
import { NameResult, getRealName } from "../utils/name";
import { singleCharacterInfoPromise } from "../utils/promise";
import { render } from "../utils/render";
import { getRegion } from "#genshin/utils/region";
import { omit } from "lodash";
import { characterID, privateClass } from "#genshin/init";

interface QueryParam {
	uid: string;
	name: string;
	account?: Private;
}

export async function main(
	{ sendMessage, messageData, redis }: InputParameter
): Promise<void> {
	const userID: number = messageData.user_id;
	const query: QueryParam = {
		uid: "",
		name: "",
		account: undefined
	};
	
	const info: string[] = messageData.raw_message.split( " " );
	if ( info.length === 1 ) {
		/* 处理 UID 和 名称 间不加空格的操作 */
		if ( /\d{9}/.test( info[0] ) ) {
			query.uid = info[0].substring( 0, 9 );
			query.name = info[0].substr( 9 );
		} else {
			const pList: Private[] = privateClass.getUserPrivateList( userID );
			const queryUID: string = await redis.getString(
				`silvery-star.user-bind-uid-${ userID }`
			);
			query.name = info[0];
			
			/* 只包含角色名时，优先查询私人服务 */
			if ( pList.length !== 0 ) {
				query.account = pList[0];
				query.uid = query.account.setting.uid;
			} else if ( queryUID.length !== 0 ) {
				query.uid = queryUID;
			} else {
				await sendMessage( "你还未绑定游戏UID或申请私人服务" );
				return;
			}
		}
	} else if ( info.length === 2 ) {
		query.name = info[1];
		if ( info[0].length === 9 ) {
			query.uid = info[0];
		} else {
			const pList: Private[] = privateClass.getUserPrivateList( userID );
			const privateID: number = parseInt( info[0] );
			if ( pList.length < privateID || privateID === 0 ) {
				const auth: AuthLevel = await bot.auth.get( userID );
				const PRIVATE_LIST = <Order>bot.command.getSingle(
					"silvery-star.private-list", auth
				);
				await sendMessage( `无效的编号，请使用 ${ PRIVATE_LIST.getHeaders()[0] } 检查` );
				return;
			}
			query.account = pList[privateID - 1];
			query.uid = query.account.setting.uid;
		}
	} else {
		await sendMessage( "指令格式错误" );
		return;
	}
	if ( query.name.length === 0 ) {
		await sendMessage( "未输入角色名称" );
		return;
	}
	
	const result: NameResult = getRealName( query.name );
	if ( !result.definite ) {
		const message: string = result.info.length === 0
			? "查询失败，请检查角色名称是否正确"
			: `未找到相关信息，是否要找：${ [ "", ...<string[]>result.info ].join( "\n  - " ) }`;
		await sendMessage( message );
		return;
	}
	const realName: string = <string>result.info;
	
	const charID: number = characterID.map[realName];
	const server: string = getRegion( query.uid[0] );
	
	try {
		const data = await singleCharacterInfoPromise( parseInt( query.uid ), server, charID );
		const artifacts: Artifact[] = data.reliquaries;
		
		const image: string = await render( "character", {
			data: Buffer.from( JSON.stringify( {
				...data,
				reliquaries: artifacts.map( el => omit( el, [ "set" ] ) )
			} ) ).toString( "base64" )
		} );
		await sendMessage( image );
	} catch ( error ) {
		await sendMessage( <string>error );
	}
}