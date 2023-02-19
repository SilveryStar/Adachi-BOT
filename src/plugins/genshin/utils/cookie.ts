import bot from "ROOT";
import { Order } from "@modules/command";
import { AuthLevel } from "@modules/management/auth";
import { cookies } from "#genshin/init";
import {
	ErrorMsg,
	getCookieTokenBySToken, getLtoken,
	getMidByLtoken,
	getMultiToken
} from "#genshin/utils/promise";
import { getBaseInfo } from "#genshin/utils/api";
import * as ApiType from "#genshin/types";
import { Cookies } from "#genshin/module";
import { Private } from "#genshin/module/private/main";

/**
Author: Extrwave
CreateTime: 2022/11/12
 */


export interface FilterMysCookieResult {
	uid: string,
	mysID: string,
	cookie: string,
	stoken: string
}


export function getCookiesMap( cook: string[] ): Map<string, string> {
	const cks = new Map<string, string>();
	const reg = new RegExp( /.*?tuid=([0-9]+).*?/g );
	cook.forEach( value => {
		let execRes: RegExpExecArray | null = reg.exec( value );
		const mysID: string | undefined = execRes ? execRes[1] : undefined;
		if ( mysID ) {
			cks.set( mysID, value );
		}
	} )
	return cks;
}

/**
 *  当前带Cookie的请求失败后判断错误原因
 *  @param message 报错信息
 *  @param id String 为 米游社ID，数字为Genshin UID
 *  @param isPublic 记录是否为公共查询Cookie
 *  */
export function checkCookieInvalidReason( message: string, id?: string | number, isPublic?: boolean ): string {
	let matchResult;
	const timesOut = /up to 30 other people/i, ckInvalid = /Please login|登录/i;
	const header = id ? typeof id === 'string' ? `[MysID ${ id }] ` : `[UID ${ id }] ` : "";
	const COMMIT = <Order>bot.command.getSingle( "silvery-star-private-commit", AuthLevel.Master );
	if ( timesOut.test( message ) ) {
		if ( cookies.getIndex() === 0 ) {
			bot.logger.warn( "可能所有公共cookie查询次数已上限，请增加可用cookie到config/cookie.yaml" );
			return `可能公共cookie查询次数已上限\n` +
				`建议使用 ${ COMMIT.getHeaders()[0] } 贡献你的授权\n` +
				`贡献的Cookie仅会用于公共查询服务\n` +
				`欢迎各位参与 BOT 共同运营 ~ `;
		}
		matchResult = ErrorMsg.COOKIE_UPTIME;
	} else if ( ckInvalid.test( message ) ) {
		matchResult = `${ isPublic ? ErrorMsg.PUBLIC_COOKIE_INVALID : ErrorMsg.PRIVATE_COOKIE_INVALID }`;
	}
	/* 去除空消息的可能性，保证消息能正常发出 */
	matchResult = matchResult ? matchResult : message ? message : ErrorMsg.UNKNOWN;
	header ? bot.logger.warn( header + matchResult ) : "";
	return header + matchResult;
}

/**
 * 根据Cookie获取其中的有用字段，返回所有字段按需获取
 * @param rawCookie 需要解析的cookie
 * @return MysCookieFilterResult Cookie单独字段
 *
 * */
export async function checkMysCookieInvalid( rawCookie: string ): Promise<FilterMysCookieResult> {
	
	let COOKIE = '', STOKEN = '', mysID;
	/* 首先是处理login_ticket */
	if ( rawCookie.includes( "login_ticket=" ) && rawCookie.includes( "login_uid=" ) ) {
		const { login_ticket, login_uid } = cookie2Obj( rawCookie );
		mysID = login_uid;
		const ticket = `login_uid=${ login_uid }; login_ticket=${ login_ticket }`;
		//首先获取Stoken与Ltoken
		const { stoken, ltoken } = await getMultiToken( login_uid, ticket );
		//获取mid得到完整的V2 Cookie
		const mid = await getMidByLtoken( ltoken, login_uid );
		//根据Stoken获取cookie_token
		const { cookie_token } = await getCookieTokenBySToken( stoken, mid, login_uid );
		COOKIE = `ltoken=${ ltoken }; ltuid=${ login_uid }; account_id=${ login_uid }; cookie_token=${ cookie_token };`;
		STOKEN = `stoken=${ stoken }; stuid=${ login_uid }; mid=${ mid }`;
	}
	/* 其次处理SToken */
	else if ( rawCookie.includes( "stoken=" ) && rawCookie.includes( "mid=" ) && rawCookie.includes( "stuid" ) ) {
		const { stoken, mid, stuid } = cookie2Obj( rawCookie );
		mysID = stuid;
		const ltoken = await getLtoken( stoken, mid );
		const { cookie_token } = await getCookieTokenBySToken( stoken, mid, stuid );
		COOKIE = `ltoken=${ ltoken }; ltuid=${ stuid }; account_id=${ stuid }; cookie_token=${ cookie_token };`;
		// STOKEN = `stoken=${ stoken }; stuid=${ stuid }; mid=${ mid };`;
	} else if ( rawCookie.includes( "ltoken=" ) && rawCookie.includes( "ltuid=" ) ) {
		const { ltoken, ltuid } = cookie2Obj( rawCookie );
		mysID = ltuid;
		/* V1版cookie_token直接使用 */
		if ( rawCookie.includes( "cookie_token" ) ) {
			const { cookie_token } = cookie2Obj( rawCookie );
			COOKIE = `ltoken=${ ltoken }; ltuid=${ ltuid }; account_id=${ ltuid }; cookie_token=${ cookie_token };`;
		} else {
			COOKIE = `ltoken=${ ltoken }; ltuid=${ ltuid }; account_id=${ ltuid };`;
		}
	} else {
		throw ErrorMsg.COOKIE_FORMAT_INVALID;
	}
	
	/* 验证Cookie的有效性 */
	const { retcode, message, data } = await getBaseInfo( parseInt( mysID ), COOKIE );
	if ( !ApiType.isBBS( data ) ) {
		throw ErrorMsg.UNKNOWN;
	}
	
	if ( retcode === 10001 ) {
		throw Cookies.checkExpired( COOKIE );
	}
	
	if ( retcode !== 0 ) {
		throw checkCookieInvalidReason( message );
	} else if ( !data.list || data.list.length === 0 ) {
		throw ErrorMsg.NOT_FOUND;
	}
	
	const genshinInfo: ApiType.Game | undefined = data.list.find( el => el.gameId === 2 );
	if ( !genshinInfo ) {
		throw ErrorMsg.NOT_FOUND;
	}
	const uid: string = genshinInfo.gameRoleId;
	return {
		uid: uid,
		mysID: mysID,
		cookie: COOKIE,
		stoken: STOKEN
	};
}

export async function refreshTokenBySToken( pri: Private ): Promise<FilterMysCookieResult> {
	const { stoken } = cookie2Obj( pri.setting.stoken );
	if ( !stoken ) {
		throw `没有授权SToken，无法刷新`;
	}
	bot.logger.info( `[${ pri.setting.mysID }] 正在根据SToken刷新Token` );
	return await checkMysCookieInvalid( pri.setting.stoken );
}

export function cookie2Obj( cookie: string ): any {
	return decodeURIComponent( cookie )
		.replace( /[^(\w|=|;|\-)+$]/g, "" ) //去除 除字母，数字，下划线，=，；和空白的所有值
		.split( /;/ )
		.map( value => value.trim() )
		.filter( value => value !== '' )
		.map( item => {
			return splitCookie( item, "=" );
		} )
		.reduce( ( acc, [ k, v ] ) => ( acc[k.trim().replace( '"', '' )] = v ) && acc, {} );
}

function splitCookie( raw: string, splitter: string ): string[] {
	const result: string[] = [];
	for ( let i = 0; i < raw.length; i++ ) {
		if ( raw.charAt( i ) === splitter ) {
			result.push( raw.slice( 0, i ) );
			result.push( raw.slice( i + 1, raw.length ) );
			return result;
		}
	}
	return result;
}
