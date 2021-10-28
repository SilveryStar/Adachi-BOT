import request from "./requests";
import getDS from "./ds";
import { parse } from "yaml";
import { toCamelCase } from "./camel-case";
import { set } from "lodash";
import { ResponseBody } from "../types/response";
import { SlipDetail } from "../module/slip";
import { DailyMaterial } from "../module/daily";
import { InfoResponse } from "../types";
import fetch from "node-fetch";

const __API = {
	FETCH_ROLE_ID: "https://api-takumi.mihoyo.com/game_record/app/card/wapi/getGameRecordCard",
	FETCH_ROLE_INDEX: "https://api-takumi.mihoyo.com/game_record/app/genshin/api/index",
	FETCH_ROLE_CHARACTERS: "https://api-takumi.mihoyo.com/game_record/app/genshin/api/character",
	FETCH_ROLE_SPIRAL_ABYSS: "https://api-takumi.mihoyo.com/game_record/app/genshin/api/spiralAbyss",
	FETCH_ROLE_DAILY_NOTE: "https://api-takumi.mihoyo.com/game_record/app/genshin/api/dailyNote",
	FETCH_GACHA_LIST: "https://webstatic.mihoyo.com/hk4e/gacha_info/cn_gf01/gacha/list.json",
	FETCH_GACHA_DETAIL: "https://webstatic.mihoyo.com/hk4e/gacha_info/cn_gf01/$/zh-cn.json",
	FETCH_ARTIFACT: "https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/artifact/artifact.yml",
	FETCH_SLIP: "https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/slip/index.yml",
	FETCH_WISH_CONFIG: "https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/wish/config/$.json",
	FETCH_INFO: "https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/info/docs/$.json",
	FETCH_ALIAS_SET: "https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/alias/alias.yml",
	FETCH_DAILY_MAP: "https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/daily/daily.yml"
};

const HEADERS = {
	"User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) miHoYoBBS/2.11.1",
	"Referer": "https://webstatic.mihoyo.com/",
	"x-rpc-app_version": "2.11.1",
	"x-rpc-client_type": 5,
	"DS": "",
	"Cookie": ""
};

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
				const data: ResponseBody = set( resp, "data.type", "note" )
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

export async function getWishDetail( wishID: number ): Promise<any> {
	const wishLinkWithID: string = __API.FETCH_GACHA_DETAIL.replace( "$", wishID.toString() );
	
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

export async function getInfo( name: string ): Promise<InfoResponse | string> {
	const charLinkWithName: string = __API.FETCH_INFO.replace( "$", encodeURI( name ) );
	
	return new Promise( ( resolve, reject ) => {
		fetch( charLinkWithName )
			.then( ( result: Response ) => {
				if ( result.status === 404 ) {
					reject( "" );
				} else {
					resolve( result.json() as unknown as InfoResponse );
				}
			} );
	} );
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