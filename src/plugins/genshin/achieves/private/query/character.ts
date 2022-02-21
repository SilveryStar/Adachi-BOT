import { InputParameter } from "@modules/command";
import { Private } from "#genshin/module/private/main";
import { RenderResult } from "@modules/renderer";
import { Avatar, Artifact } from "#genshin/types";
import { getRealName, NameResult } from "#genshin/utils/name";
import { mysInfoPromise } from "#genshin/utils/promise";
import { getPrivateAccount } from "#genshin/utils/private";
import { omit } from "lodash";
import { characterID, renderer } from "#genshin/init";

export async function main(
	{ sendMessage, messageData, auth, redis, logger }: InputParameter
): Promise<void> {
	const { user_id: userID, raw_message: msg } = messageData;
	
	const parser = /(\d+)?\s*([\w\u4e00-\u9fa5]+)/i;
	const execRes = parser.exec( msg );
	if ( !execRes ) {
		await sendMessage( "指令格式有误" );
		return;
	}
	
	const [ ,idMsg, name ] = execRes;
	
	const info: Private | string = await getPrivateAccount( userID, idMsg, auth );
	if ( typeof info === "string" ) {
		await sendMessage( info );
		return;
	}
	
	const { cookie, mysID, uid } = info.setting;
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
	
	try {
		await mysInfoPromise( userID, mysID, cookie );
	} catch ( error ) {
		if ( error !== "gotten" ) {
			await sendMessage( <string>error );
			return;
		}
	}
	
	const { avatars } = await redis.getHash( `silvery-star.card-data-${ uid }` );
	const charInfo = ( <Avatar[]>JSON.parse( avatars ) ).find( ( { id } ) => {
		return charID === -1 ? id === 10000005 || id === 10000007 : id === charID;
	} );
	
	if ( !charInfo ) {
		await sendMessage( `[UID-${ uid }] 未拥有角色 ${ realName }` );
		return;
	}
	// @ts-ignore
	const artifacts: Artifact[] = charInfo.artifacts;
	
	const dbKey: string = `silvery-star.character-temp-${ userID }`;
	await redis.setString( dbKey, JSON.stringify( {
		...charInfo,
		reliquaries: artifacts.map( el => omit( el, [ "set" ] ) ),
		uid
	} ) );
	
	const res: RenderResult = await renderer.asCqCode(
		"/character.html",
		{ qq: userID }
	);
	if ( res.code === "ok" ) {
		await sendMessage( res.data );
	} else {
		logger.error( res.error );
		await sendMessage( "图片渲染异常，请联系持有者进行反馈" );
	}
}