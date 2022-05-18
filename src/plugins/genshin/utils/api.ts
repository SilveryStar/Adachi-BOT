import request from "./requests";
import { parse } from "yaml";
import { toCamelCase } from "./camel-case";
import { set } from "lodash";
import { guid } from "../utils/guid";
import { getDS, getDS2 } from "./ds";
import { ResponseBody, InfoResponse } from "#genshin/types";
import { SlipDetail } from "../module/slip";
import { DailyMaterial } from "../module/daily";
import { FortuneData } from "../module/almanac";
import fetch from "node-fetch";

const __API = {
	FETCH_ROLE_ID: "https://api-takumi-record.mihoyo.com/game_record/app/card/wapi/getGameRecordCard",
	FETCH_ROLE_INDEX: "https://api-takumi-record.mihoyo.com/game_record/app/genshin/api/index",
	FETCH_ROLE_CHARACTERS: "https://api-takumi-record.mihoyo.com/game_record/app/genshin/api/character",
	FETCH_ROLE_SPIRAL_ABYSS: "https://api-takumi-record.mihoyo.com/game_record/app/genshin/api/spiralAbyss",
	FETCH_ROLE_DAILY_NOTE: "https://api-takumi-record.mihoyo.com/game_record/app/genshin/api/dailyNote",
	FETCH_ROLE_AVATAR_DETAIL: "https://api-takumi.mihoyo.com/event/e20200928calculate/v1/sync/avatar/detail",
	FETCH_GACHA_LIST: "https://webstatic.mihoyo.com/hk4e/gacha_info/cn_gf01/gacha/list.json",
	FETCH_GACHA_DETAIL: "https://webstatic.mihoyo.com/hk4e/gacha_info/cn_gf01/$/zh-cn.json",
	FETCH_ARTIFACT: "https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/artifact/artifact.yml",
	FETCH_SLIP: "https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/slip/index.yml",
	FETCH_WISH_CONFIG: "https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/wish/config/$.json",
	FETCH_INFO: "https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/info/docs/$.json",
	FETCH_GUIDE: "https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/guide/$.png",
	FETCH_ALIAS_SET: "https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/alias/alias.yml",
	FETCH_DAILY_MAP: "https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/daily/daily.yml",
	FETCH_ALMANAC: "https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/almanac/almanac.yml",
	FETCH_CHARACTER_ID: "https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/character/id.yml",
	FETCH_UID_HOME: "https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/home/home.yml",
	FETCH_SIGN_IN: "https://api-takumi.mihoyo.com/event/bbs_sign_reward/sign",
	FETCH_SIGN_INFO: "https://api-takumi.mihoyo.com/event/bbs_sign_reward/info",
	FETCH_LEDGER: "https://hk4e-api.mihoyo.com/event/ys_ledger/monthInfo"
};

const HEADERS = {
	"User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) miHoYoBBS/2.11.1",
	"Referer": "https://webstatic.mihoyo.com/",
	"x-rpc-app_version": "2.11.1",
	"x-rpc-client_type": 5,
	"DS": "",
	"Cookie": ""
};

/* mihoyo BBS API */
export async function getBaseInfo( mysID: number, cookie: string ): Promise<ResponseBody> {
	const query = { uid: mysID };
	return new Promise( ( resolve, reject ) => {
		request( {
			method: "GET",
			url: __API.FETCH_ROLE_ID,
			qs: query,
			headers: {
				...HEADERS,
				"DS": getDS( query ),
				"Cookie": cookie
			}
		} )
			.then( ( result ) => {
				const resp = toCamelCase( JSON.parse( result ) );
				const data: ResponseBody = set( resp, "data.type", "bbs" )
				resolve( data );
			} )
			.catch( ( reason ) => {
				reject( reason );
			} );
	} );
}

export async function getDetailInfo( uid: number, server: string, cookie: string ): Promise<ResponseBody> {
	const query = {
		role_id: uid,
		server
	};
	return new Promise( ( resolve, reject ) => {
		request( {
			method: "GET",
			url: __API.FETCH_ROLE_INDEX,
			qs: query,
			headers: {
				...HEADERS,
				"DS": getDS( query ),
				"Cookie": cookie
			}
		} )
			.then( ( result ) => {
				const resp = toCamelCase( JSON.parse( result ) );
				const data: ResponseBody = set( resp, "data.type", "user-info" )
				resolve( data );
			} )
			.catch( ( reason ) => {
				reject( reason );
			} );
	} );
}

export async function getCharactersInfo( roleID: number, server: string, charIDs: number[], cookie: string ): Promise<ResponseBody> {
	const body = {
		character_ids: charIDs,
		role_id: roleID,
		server
	};
	
	return new Promise( ( resolve, reject ) => {
		request( {
			method: "POST",
			url: __API.FETCH_ROLE_CHARACTERS,
			json: true,
			body,
			headers: {
				...HEADERS,
				"DS": getDS( undefined, JSON.stringify( body ) ),
				"Cookie": cookie,
				"content-type": "application/json"
			}
		} )
			.then( ( result ) => {
				const resp = toCamelCase( result );
				const data: ResponseBody = set( resp, "data.type", "character" )
				resolve( data );
			} )
			.catch( ( reason ) => {
				reject( reason );
			} );
	} );
}

export async function getDailyNoteInfo( uid: number, server: string, cookie: string ): Promise<ResponseBody> {
	const query = {
		role_id: uid,
		server
	};
	return new Promise( ( resolve, reject ) => {
		request( {
			method: "GET",
			url: __API.FETCH_ROLE_DAILY_NOTE,
			qs: query,
			headers: {
				...HEADERS,
				"DS": getDS( query ),
				"Cookie": cookie
			}
		} )
			.then( ( result ) => {
				const resp = toCamelCase( JSON.parse( result ) );
				const data: ResponseBody = set( resp, "data.type", "note" );
				resolve( data );
			} )
			.catch( ( reason ) => {
				reject( reason );
			} );
	} );
}

export async function getAvatarDetailInfo( uid: string, avatarID: number, server: string, cookie: string ): Promise<ResponseBody> {
	const query = {
		avatar_id: avatarID,
		region: server,
		uid
	};
	return new Promise( ( resolve, reject ) => {
		request( {
			method: "GET",
			url: __API.FETCH_ROLE_AVATAR_DETAIL,
			qs: query,
			headers: {
				...HEADERS,
				"DS": getDS( query ),
				"Cookie": cookie
			}
		} )
			.then( ( result ) => {
				const resp = toCamelCase( JSON.parse( result ) );
				const data: ResponseBody = set( resp, "data.type", "avatar" );
				resolve( data );
			} )
			.catch( ( reason ) => {
				reject( reason );
			} );
	} );
}

/* period 为 1 时表示本期深渊，2 时为上期深渊 */
export async function getSpiralAbyssInfo( roleID: number, server: string, period: number, cookie: string ): Promise<ResponseBody> {
	const query = {
		role_id: roleID,
		schedule_type: period,
		server
	};
	
	return new Promise( ( resolve, reject ) => {
		request( {
			method: "GET",
			url: __API.FETCH_ROLE_SPIRAL_ABYSS,
			qs: query,
			headers: {
				...HEADERS,
				"DS": getDS( query ),
				"Cookie": cookie
			}
		} )
			.then( ( result ) => {
				const resp = toCamelCase( JSON.parse( result ) );
				const data: ResponseBody = set( resp, "data.type", "abyss" )
				resolve( data );
			} )
			.catch( ( reason ) => {
				reject( reason );
			} );
	} );
}

export async function getLedger( uid: string, server: string, mon: number, cookie: string ): Promise<any> {
	const query = {
		bind_uid: uid,
		bind_region: server,
		month: mon
	};
	
	return new Promise( ( resolve, reject ) => {
		request( {
			method: "GET",
			url: __API.FETCH_LEDGER,
			qs: query,
			headers: {
				...HEADERS,
				"Cookie": cookie
			}
		} )
			.then( ( result ) => {
				const resp = toCamelCase( JSON.parse( result ) );
				const data: ResponseBody = set( resp, "data.type", "ledger" )
				resolve( data );
			} )
			.catch( ( reason ) => {
				reject( reason );
			} );
	} );
}

export async function getWishList(): Promise<any> {
	return new Promise( ( resolve, reject ) => {
		request( {
			method: "GET",
			url: __API.FETCH_GACHA_LIST
		} )
			.then( ( result ) => {
				resolve( JSON.parse( result ) );
			} )
			.catch( ( reason ) => {
				reject( reason );
			} );
	} );
}

export async function getWishDetail( wishID: string ): Promise<any> {
	const wishLinkWithID: string = __API.FETCH_GACHA_DETAIL.replace( "$", wishID );
	
	return new Promise( ( resolve, reject ) => {
		request( {
			method: "GET",
			url: wishLinkWithID
		} )
			.then( ( result ) => {
				resolve( JSON.parse( result ) );
			} )
			.catch( ( reason ) => {
				reject( reason );
			} );
	} );
}

/* OSS API */
export async function getInfo( name: string ): Promise<InfoResponse | string> {
	const charLinkWithName: string = __API.FETCH_INFO.replace( "$", encodeURI( name ) );
	
	return new Promise( ( resolve, reject ) => {
		fetch( charLinkWithName )
			.then( ( result: Response ) => {
				if ( result.status === 404 ) {
					reject( "" );
				} else {
					resolve( <InfoResponse><unknown>result.json() );
				}
			} );
	} );
}

export async function checkGuideExist( name: string ): Promise<boolean | string> {
	const charLinkWithName: string = __API.FETCH_GUIDE.replace( "$", encodeURI( name ) );
	
	return new Promise( ( resolve ) => {
		fetch( charLinkWithName ).then( ( result: Response ) => {
			resolve( result.status !== 404 );
		} ).catch( ( error: Error ) => {
			resolve( error.message );
		} )
	} )
}

export async function getArtifact(): Promise<any> {
	return new Promise( ( resolve ) => {
		fetch( __API.FETCH_ARTIFACT )
			.then( async ( result: Response ) => {
				resolve( parse( await result.text() ) );
			} );
	} );
}

export async function getSlip(): Promise<SlipDetail> {
	return new Promise( ( resolve ) => {
		fetch( __API.FETCH_SLIP )
			.then( async ( result: Response ) => {
				resolve( parse( await result.text() ) );
			} );
	} );
}

export async function getWishConfig( type: string ): Promise<any> {
	const wishLinkWithType: string = __API.FETCH_WISH_CONFIG.replace( "$", type );
	
	return new Promise( ( resolve, reject ) => {
		fetch( wishLinkWithType )
			.then( ( result: Response ) => {
				if ( result.status === 404 ) {
					reject( "" );
				} else {
					resolve( result.json() );
				}
			} );
	} );
}

export async function getAliasName(): Promise<any> {
	return new Promise( ( resolve ) => {
		fetch( __API.FETCH_ALIAS_SET )
			.then( async ( result: Response ) => {
				resolve( parse( await result.text() ).set );
			} );
	} );
}

export async function getDailyMaterial(): Promise<DailyMaterial> {
	return new Promise( ( resolve ) => {
		fetch( __API.FETCH_DAILY_MAP )
			.then( async ( result: Response ) => {
				resolve( parse( await result.text() ) );
			} );
	} );
}

/* 文本来源 可莉特调 https: //genshin.pub/ */
export async function getAlmanacText(): Promise<Record<string, FortuneData[]>> {
	return new Promise( ( resolve ) => {
		fetch( __API.FETCH_ALMANAC )
			.then( async ( result: Response ) => {
				resolve( parse( await result.text() ) );
			} );
	} );
}

export async function getCharacterID(): Promise<Record<string, number>> {
	return new Promise( ( resolve ) => {
		fetch( __API.FETCH_CHARACTER_ID )
			.then( async ( result: Response ) => {
				resolve( parse( await result.text() ) );
			} );
	} );
}

export async function getUidHome(): Promise<any> {
	return new Promise( ( resolve ) => {
		fetch( __API.FETCH_UID_HOME )
			.then( async ( result: Response ) => {
				resolve( parse( await result.text() ).list );
			} );
	} );
}

/* 参考 https://github.com/DGP-Studio/DGP.Genshin.MiHoYoAPI/blob/main/Sign/SignInProvider.cs */
const activityID: string = "e202009291139501";
const SIGN_HEADERS = {
	"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) miHoYoBBS/2.10.1",
	"Referer": "https://webstatic.mihoyo.com/bbs/event/signin-ys/index.html" +
		`?bbs_auth_required=true&act_id=${ activityID }&utm_source=bbs&utm_medium=mys&utm_campaign=icon`,
	"Accept": "application/json",
	"Accept-Encoding": "gzip, deflate",
	"X-Requested-With": "com.mihoyo.hyperion",
	"x-rpc-app_version": "2.10.1",
	"x-rpc-client_type": 5,
	"x-rpc-device_id": guid()
};

/* Sign In API */
export async function mihoyoBBSSignIn( uid: string, region: string, cookie: string ): Promise<ResponseBody> {
	const body = {
		act_id: activityID,
		uid, region
	};
	
	return new Promise( ( resolve, reject ) => {
		request( {
			method: "POST",
			url: __API.FETCH_SIGN_IN,
			json: true,
			body,
			headers: {
				...SIGN_HEADERS,
				"content-type": "application/json",
				"DS": getDS2(),
				"Cookie": cookie
			}
		} )
			.then( ( result ) => {
				const resp = toCamelCase( result );
				if ( !resp.data ) {
					reject( resp.message || resp.msg );
					return;
				}
				const data: ResponseBody = set( resp, "data.type", "sign-in-result" )
				resolve( data );
			} )
			.catch( ( reason ) => {
				reject( reason );
			} );
	} );
}

export async function getSignInInfo( uid: string, region: string, cookie: string ): Promise<ResponseBody> {
	const query = {
		act_id: activityID,
		region, uid
	};
	
	return new Promise( ( resolve, reject ) => {
		request( {
			method: "GET",
			url: __API.FETCH_SIGN_INFO,
			qs: query,
			headers: {
				...SIGN_HEADERS,
				"Cookie": cookie
			}
		} )
			.then( ( result ) => {
				const resp = toCamelCase( JSON.parse( result ) );
				if ( !resp.data ) {
					reject( resp.message || resp.msg );
					return;
				}
				const data: ResponseBody = set( resp, "data.type", "sign-in-info" )
				resolve( data );
			} )
			.catch( ( reason ) => {
				reject( reason );
			} );
	} );
}