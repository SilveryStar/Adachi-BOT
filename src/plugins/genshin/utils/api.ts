import bot from "ROOT";
import { toCamelCase } from "./camel-case";
import { guid } from "#/genshin/utils/guid";
import { generateDS, getDS, getDS2 } from "./ds";
import {
	ResponseBody
} from "#/genshin/types";
import * as ApiType from "#/genshin/types";
import { config } from "#/genshin/init";
import { register } from "@/utils/request";
import { getRandomString, randomSleep } from "@/utils/random";

const apis = {
	FETCH_ROLE_ID: "https://api-takumi-record.mihoyo.com/game_record/app/card/wapi/getGameRecordCard",
	FETCH_ROLE_INDEX: "https://api-takumi-record.mihoyo.com/game_record/app/genshin/api/index",
	FETCH_ROLE_CHARACTERS: "https://api-takumi-record.mihoyo.com/game_record/app/genshin/api/character",
	FETCH_ROLE_SPIRAL_ABYSS: "https://api-takumi-record.mihoyo.com/game_record/app/genshin/api/spiralAbyss",
	FETCH_ROLE_DAILY_NOTE: "https://api-takumi-record.mihoyo.com/game_record/app/genshin/api/dailyNote",
	FETCH_ROLE_AVATAR_DETAIL: "https://api-takumi.mihoyo.com/event/e20200928calculate/v1/sync/avatar/detail",
	FETCH_GACHA_LIST: "https://webstatic.mihoyo.com/hk4e/gacha_info/cn_gf01/gacha/list.json",
	FETCH_GACHA_DETAIL: "https://webstatic.mihoyo.com/hk4e/gacha_info/cn_gf01/$/zh-cn.json",
	
	FETCH_SIGN_IN: "https://api-takumi.mihoyo.com/event/bbs_sign_reward/sign",
	FETCH_SIGN_INFO: "https://api-takumi.mihoyo.com/event/bbs_sign_reward/info",
	FETCH_LEDGER: "https://hk4e-api.mihoyo.com/event/ys_ledger/monthInfo",
	FETCH_CALENDAR_LIST: "https://hk4e-api.mihoyo.com/common/hk4e_cn/announcement/api/getAnnList",
	FETCH_CALENDAR_DETAIL: "https://hk4e-api.mihoyo.com/common/hk4e_cn/announcement/api/getAnnContent",
	//验证码服务相关
	FETCH_CREATE_VERIFICATION: "https://api-takumi-record.mihoyo.com/game_record/app/card/wapi/createVerification",
	FETCH_GEETEST: "https://api.geetest.com/gettype.php",
	FETCH_GET_VERIFY: "https://challenge.minigg.cn",
	FETCH_VERIFY_VERIFICATION: "https://api-takumi-record.mihoyo.com/game_record/app/card/wapi/verifyVerification",
	/* Token转换相关 */
	FETCH_GET_MULTI_TOKEN: "https://api-takumi.mihoyo.com/auth/api/getMultiTokenByLoginTicket",
	FETCH_GET_COOKIE_TOKEN: "https://api-takumi.mihoyo.com/auth/api/getCookieAccountInfoBySToken",
	FETCH_VERIFY_LTOKEN: "https://passport-api-v4.mihoyo.com/account/ma-cn-session/web/verifyLtoken",
	FETCH_GET_LTOKEN_BY_STOKEN: "https://passport-api.mihoyo.com/account/auth/api/getLTokenBySToken"
};

const HEADERS = {
	"User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) miHoYoBBS/2.29.1",
	"Referer": "https://webstatic.mihoyo.com/",
	"x-rpc-app_version": "2.29.1",
	"x-rpc-client_type": 5,
	"DS": "",
	"Cookie": ""
};

const verifyMsg = "API请求遭遇验证码拦截，可以尝试联系Master开启验证服务";

const { request: $https } = register( {
	timeout: 60000,
	responseType: "json",
}, apis );

/* mihoyo BBS API */
export async function getBaseInfo(
	mysID: number,
	cookie: string,
	time: number = 0,
	verifyResult: string = ''
): Promise<ResponseBody<ApiType.BBS>> {
	const query = { uid: mysID };
	const { data: result } = await $https.FETCH_ROLE_ID.get( query, {
		headers: {
			...HEADERS,
			DS: getDS( query ),
			Cookie: cookie
		}
	} )
	const data: ResponseBody<ApiType.BBS> = toCamelCase( result );
	if ( data.retcode !== 1034 ) {
		return data;
	}
	bot.logger.warn( `[ MysID${ mysID } ][base] 查询遇到验证码` );
	if ( config.verifyEnable && time <= config.verifyRepeat ) {
		verifyResult = await bypassQueryVerification( cookie );
		bot.logger.debug( `[ MysID${ mysID } ][base] 第 ${ time + 1 } 次验证码绕过${ verifyResult ? "失败：" + verifyResult : "成功" }` );
		return await getBaseInfo( mysID, cookie, ++time, verifyResult );
	}
	throw config.verifyEnable ? "[base] " + verifyResult : verifyMsg;
}

export async function getDetailInfo(
	uid: number,
	server: string,
	cookie: string,
	time: number = 0,
	verifyResult: string = ''
): Promise<ResponseBody<ApiType.UserInfo>> {
	const query = {
		role_id: uid,
		server
	};
	const { data: result } = await $https.FETCH_ROLE_INDEX.get( query, {
		headers: {
			...HEADERS,
			DS: getDS( query ),
			Cookie: cookie
		}
	} );
	const data: ResponseBody<ApiType.UserInfo> = toCamelCase( result );
	if ( data.retcode !== 1034 ) {
		return data;
	}
	bot.logger.warn( `[ UID${ uid } ][detail] 查询遇到验证码` );
	if ( config.verifyEnable && time <= config.verifyRepeat ) {
		verifyResult = await bypassQueryVerification( cookie );
		bot.logger.debug( `[ UID${ uid } ][detail] 第 ${ time + 1 } 次验证码绕过${ verifyResult ? "失败：" + verifyResult : "成功" }` );
		return await getDetailInfo( uid, server, cookie, ++time, verifyResult );
	}
	throw config.verifyEnable ? "[detail] " + verifyResult : verifyMsg;
}

export async function getCharactersInfo(
	roleID: number,
	server: string,
	charIDs: number[],
	cookie: string,
	time: number = 0,
	verifyResult: string = ''
): Promise<ResponseBody<ApiType.Character>> {
	const body = {
		character_ids: charIDs,
		role_id: roleID,
		server
	};
	
	const { data: result } = await $https.FETCH_ROLE_CHARACTERS.post( body, {
		headers: {
			...HEADERS,
			DS: getDS( undefined, JSON.stringify( body ) ),
			Cookie: cookie,
			"content-type": "application/json"
		}
	} );
	
	const data: ResponseBody<ApiType.Character> = toCamelCase( result );
	if ( data.retcode !== 1034 ) {
		return data;
	}
	bot.logger.warn( `[ UID${ roleID } ][char] 查询遇到验证码` );
	if ( config.verifyEnable && time <= config.verifyRepeat ) {
		verifyResult = await bypassQueryVerification( cookie );
		bot.logger.debug( `[ UID${ roleID } ][char] 第 ${ time + 1 } 次验证码绕过${ verifyResult ? "失败：" + verifyResult : "成功" }` );
		return await getCharactersInfo( roleID, server, charIDs, cookie, ++time, verifyResult );
	}
	throw config.verifyEnable ? "[char] " + verifyResult : verifyMsg;
}

export async function getDailyNoteInfo(
	uid: number,
	server: string,
	cookie: string,
	time: number = 0,
	verifyResult: string = ''
): Promise<ResponseBody<ApiType.Note>> {
	const query = {
		role_id: uid,
		server
	};
	const { data: result } = await $https.FETCH_ROLE_DAILY_NOTE.get( query, {
		headers: {
			...HEADERS,
			DS: getDS( query ),
			Cookie: cookie
		}
	} )
	const data: ResponseBody<ApiType.Note> = toCamelCase( result );
	if ( data.retcode !== 1034 ) {
		return data;
	}
	bot.logger.warn( `[ UID${ uid } ][note] 查询遇到验证码` );
	if ( config.verifyEnable && time <= config.verifyRepeat ) {
		verifyResult = await bypassQueryVerification( cookie );
		bot.logger.debug( `[ UID${ uid } ][note] 第 ${ time + 1 } 次验证码绕过${ verifyResult ? "失败：" + verifyResult : "成功" }` );
		return await getDailyNoteInfo( uid, server, cookie, ++time, verifyResult );
	}
	throw config.verifyEnable ? "[note] " + verifyResult : verifyMsg;
}

export async function getAvatarDetailInfo(
	uid: string,
	avatarID: number,
	server: string,
	cookie: string,
	time: number = 0,
	verifyResult: string = ''
): Promise<ResponseBody<ApiType.AvatarDetailRaw>> {
	const query = {
		avatar_id: avatarID,
		region: server,
		uid
	};
	const { data: result } = await $https.FETCH_ROLE_AVATAR_DETAIL.get( query, {
		headers: {
			...HEADERS,
			"DS": getDS( query ),
			"Cookie": cookie
		}
	} );
	const data: ResponseBody<ApiType.AvatarDetailRaw> = toCamelCase( result );
	if ( data.retcode !== 1034 ) {
		return data;
	}
	bot.logger.warn( `[ UID${ uid } ][avatar] 查询遇到验证码` );
	if ( config.verifyEnable && time <= config.verifyRepeat ) {
		verifyResult = await bypassQueryVerification( cookie );
		bot.logger.debug( `[ UID${ uid } ][avatar] 第 ${ time + 1 } 次验证码绕过${ verifyResult ? "失败：" + verifyResult : "成功" }` );
		return await getAvatarDetailInfo( uid, avatarID, server, cookie, ++time, verifyResult );
	}
	throw config.verifyEnable ? "[avatar] " + verifyResult : verifyMsg;
}

/* period 为 1 时表示本期深渊，2 时为上期深渊 */
export async function getSpiralAbyssInfo(
	roleID: number,
	server: string,
	period: number,
	cookie: string,
	time: number = 0,
	verifyResult: string = ''
): Promise<ResponseBody<ApiType.Abyss>> {
	const query = {
		role_id: roleID,
		schedule_type: period,
		server
	};
	const { data: result } = await $https.FETCH_ROLE_SPIRAL_ABYSS.get( query, {
		headers: {
			...HEADERS,
			DS: getDS( query ),
			Cookie: cookie
		}
	} )
	const data: ResponseBody<ApiType.Abyss> = toCamelCase( result );
	if ( data.retcode !== 1034 ) {
		return data;
	}
	bot.logger.warn( `[ UID${ roleID } ][abyss] 查询遇到验证码` );
	if ( config.verifyEnable && time <= config.verifyRepeat ) {
		verifyResult = await bypassQueryVerification( cookie );
		bot.logger.debug( `[ UID${ roleID } ][abyss] 第 ${ time + 1 } 次验证码绕过${ verifyResult ? "失败：" + verifyResult : "成功" }` );
		return await getSpiralAbyssInfo( roleID, server, period, cookie, ++time, verifyResult );
	}
	throw config.verifyEnable ? "[abyss] " + verifyResult : verifyMsg;
}

export async function getLedger(
	uid: string,
	server: string,
	mon: number,
	cookie: string,
	time: number = 0,
	verifyResult: string = ''
): Promise<ResponseBody<ApiType.Ledger>> {
	const query = {
		bind_uid: uid,
		bind_region: server,
		month: mon
	};
	const { data: result } = await $https.FETCH_LEDGER.get( query, {
		headers: {
			...HEADERS,
			Cookie: cookie
		}
	} );
	const data: ResponseBody<ApiType.Ledger> = toCamelCase( result );
	if ( data.retcode !== 1034 ) {
		return data;
	}
	bot.logger.warn( `[ UID${ uid } ][ledger] 查询遇到验证码` );
	if ( config.verifyEnable && time <= config.verifyRepeat ) {
		verifyResult = await bypassQueryVerification( cookie );
		bot.logger.debug( `[ UID${ uid } ][ledger] 第 ${ time + 1 } 次验证码绕过${ verifyResult ? "失败：" + verifyResult : "成功" }` );
		return await getLedger( uid, server, mon, cookie, ++time, verifyResult );
	}
	throw config.verifyEnable ? "[ledger] " + verifyResult : verifyMsg;
}

export async function getWishList(): Promise<ResponseBody<ApiType.WishList>> {
	const { data: result } = await $https.FETCH_GACHA_LIST.get();
	if ( !result.data ) {
		throw result.message;
	}
	return toCamelCase( result );
}

export async function getWishDetail( wishID: string ): Promise<ApiType.WishDetail> {
	const { data } = await $https.FETCH_GACHA_DETAIL.get( {}, url => url.replace( "$", wishID ) );
	return toCamelCase( data );
}

/* calender API */
const calc_query = {
	game: "hk4e",
	game_biz: "hk4e_cn",
	lang: "zh-cn",
	bundle_id: "hk4e_cn",
	platform: "pc",
	region: "cn_gf01",
	level: "55",
	uid: "100000000"
};

export async function getCalendarList(): Promise<ResponseBody<ApiType.CalendarList>> {
	const { data: result } = await $https.FETCH_CALENDAR_LIST.get( calc_query );
	if ( !result.data ) {
		throw result.message;
	}
	return toCamelCase( result );
}

export async function getCalendarDetail(): Promise<ResponseBody<ApiType.CalendarDetail>> {
	const { data: result } = await $https.FETCH_CALENDAR_DETAIL.get( calc_query );
	if ( !result.data ) {
		throw result.message;
	}
	return toCamelCase( result );
}

/* 参考 https://github.com/DGP-Studio/DGP.Genshin.MiHoYoAPI/blob/main/Sign/SignInProvider.cs */
const activityID: string = "e202009291139501";
const SIGN_HEADERS = {
	"User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 12_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) miHoYoBBS/2.34.1",
	"Referer": "https://webstatic.mihoyo.com/bbs/event/signin-ys/index.html" +
		`?bbs_auth_required=true&act_id=${ activityID }&utm_source=bbs&utm_medium=mys&utm_campaign=icon`,
	"Accept": "application/json, text/plain, */*",
	"Accept-Encoding": "gzip, deflate",
	"Accept-Language": "zh-CN,en-US;q=0.8",
	"Origin": "https://webstatic.mihoyo.com",
	"X-Requested-With": "com.mihoyo.hyperion",
	"x-rpc-app_version": "2.34.1",
	"x-rpc-client_type": 5,
	"x-rpc-platform": "ios",
	"x-rpc-device_model": "iPhone7,1",
	"x-rpc-device_name": "aaaaa",
	"x-rpc-channel": "appstore",
	"x-rpc-sys_version": "12.4.1",
	"x-rpc-device_id": guid(),
	"DS": ""
};

/* Sign In API */
export async function mihoyoBBSSignIn( uid: string, region: string, cookie: string, time: number = 0 ): Promise<ResponseBody<ApiType.SignInResult>> {
	const body = {
		act_id: activityID,
		uid, region
	};
	
	const { data: result } = await $https.FETCH_SIGN_IN.post( body, {
		headers: {
			...SIGN_HEADERS,
			"content-type": "application/json",
			Cookie: cookie,
			DS: getDS2()
		}
	} );
	const resp: ResponseBody<ApiType.SignInResult> = toCamelCase( result );
	if ( !resp.data.gt && resp.data.success === 0 ) {
		return resp;
	}
	//遇到验证码
	bot.logger.warn( `[ UID${ uid } ][sign] 签到遇到验证码` );
	if ( resp.data.gt && resp.data.challenge ) {
		bot.logger.debug( `[ UID${ uid } ][sign] 遇到验证码，尝试绕过 ~` );
		return mihoyoBBSVerifySignIn( uid, region, cookie, resp.data.gt, resp.data.challenge );
	}
	throw `解决签到验证码失败 ${ typeof result === 'string' ? "\n" + result : "" }`;
}

export async function getSignInInfo( uid: string, region: string, cookie: string ): Promise<ResponseBody<ApiType.SignInInfo>> {
	const query = {
		act_id: activityID,
		region, uid
	};
	const { data: result } = await $https.FETCH_SIGN_INFO.get( query, {
		headers: {
			...SIGN_HEADERS,
			Cookie: cookie
		}
	} );
	if ( !result.data ) {
		throw result.message;
	}
	return toCamelCase( result );
}

/* 验证码相关解决方案 */
export async function bypassQueryVerification( cookie: string, gt?: string, challenge?: string ): Promise<string> {
	const data = {
		gt: gt ? gt : '',
		challenge: challenge ? challenge : ''
	};
	if ( !gt || !challenge ) {
		//获取验证码
		const { data: createVerify } = await $https.FETCH_CREATE_VERIFICATION.get( { is_high: "true" }, {
			headers: {
				...HEADERS,
				DS: getDS( { is_high: true } ),
				Cookie: cookie
			}
		} )
		if ( !createVerify.data ) {
			bot.logger.error( "[create]", createVerify );
			return "[create] 获取验证码失败";
		}
		data.gt = createVerify.data.gt;
		data.challenge = createVerify.data.challenge;
	}
	//提交GEETEST
	await randomSleep( 3, 5, true );
	await $https.FETCH_GEETEST.get( {
		gt: data.gt,
		challenge: data.challenge
	} );
	//验证验证码
	const { data: analysisCode } = await $https.FETCH_GET_VERIFY.get( {
		token: config.verifyToken,
		gt: data.gt,
		challenge: data.challenge
	}, {
		headers: {
			"User-Agent": "Adachi-BOT"
		}
	} );
	if ( analysisCode.code !== 0 || analysisCode.info !== "success" ) {
		bot.logger.error( "[verify]", analysisCode );
		return `[verify] 验证失败 ${ typeof analysisCode === 'string' ? "\n" + analysisCode : analysisCode.info }`;
	}
	const body = {
		geetest_challenge: analysisCode.data.challenge,
		geetest_validate: analysisCode.data.validate,
		geetest_seccode: `${ analysisCode.data.validate }|jordan`
	}
	const { data: verifyResult } = await $https.FETCH_VERIFY_VERIFICATION.post( body, {
		headers: {
			...HEADERS,
			DS: getDS( undefined, JSON.stringify( body ) ),
			Cookie: cookie
		}
	} )
	/* 验证码过期 */
	if ( verifyResult.retcode !== 0 || verifyResult.message !== 'OK' ) {
		bot.logger.error( "[submit]", verifyResult );
		return `[submit] 验证失败 ${ typeof verifyResult === 'string' ? "\n" + verifyResult : verifyResult.message }`;
	}
	return "";
}

export async function mihoyoBBSVerifySignIn( uid: string, region: string, cookie: string, gt: string, challenge: string ): Promise<ResponseBody<ApiType.SignInResult>> {
	const body = {
		act_id: activityID,
		uid, region
	};
	
	const { data: verifyCode } = await $https.FETCH_GET_VERIFY.get( {
		token: config.verifyToken,
		gt: gt,
		challenge: challenge
	}, {
		headers: {
			"User-Agent": "Adachi-BOT"
		}
	} );
	
	if ( verifyCode.code !== 0 || verifyCode.info !== "success" ) {
		bot.logger.error( verifyCode );
		throw `[verify] 验证失败 ${ typeof verifyCode === 'string' ? "\n" + verifyCode : verifyCode.info }`;
	}
	
	const { data: result } = await $https.FETCH_SIGN_IN.post( body, {
		headers: {
			...SIGN_HEADERS,
			"content-type": "application/json",
			Cookie: cookie,
			DS: getDS2(),
			"x-rpc-challenge": verifyCode.data.challenge,
			"x-rpc-validate": verifyCode.data.validate,
			"x-rpc-seccode": `${ verifyCode.data.validate }|jordan`
		}
	} );
	
	const resp: ResponseBody<ApiType.SignInResult> = toCamelCase( result );
	if ( !resp.data.gt && resp.data.success === 0 ) {
		return resp;
	}
	//遇到验证码
	throw `解决签到验证码失败 ${ typeof result === 'string' ? "\n" + result : "" }`;
}

/* Token转换相关API */
export async function getCookieAccountInfoBySToken(
	stoken: string,
	mid: string,
	uid: string ): Promise<ResponseBody<ApiType.CookieToken>> {
	const param = {
		stoken: stoken,
		mid: mid,
		token_types: 3,
		uid: uid
	}
	
	const { data: result } = await $https.FETCH_GET_COOKIE_TOKEN.get( param );
	
	if ( !result.data ) {
		throw result.message;
	}
	
	return toCamelCase( result );
}

export async function getMultiTokenByLoginTicket( uid: number, loginTicket: string, cookie: string ): Promise<ResponseBody<ApiType.MutiTokenResult>> {
	const params = {
		login_ticket: loginTicket,
		token_types: 3,
		uid: uid
	};
	
	const deviceName = getRandomString( 5 );
	const { data: result } = await $https.FETCH_GET_MULTI_TOKEN.get( params, {
		headers: {
			"host": "api-takumi.mihoyo.com",
			"x-rpc-app_version": "2.28.1",
			"x-rpc-channel": "mihoyo",
			"x-rpc-client_type": "2",
			"x-rpc-device_id": guid(),
			"x-rpc-device_model": deviceName,
			"x-rpc-device_name": "Samsung " + deviceName,
			"x-rpc-sys_version": "12",
			"origin": "https://webstatic.mihoyo.com",
			"referer": "https://webstatic.mihoyo.com/",
			"user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) miHoYoBBS/2.28.1",
			"x-requested-with": "com.mihoyo.hyperion",
			"ds": generateDS(),
			"cookie": cookie
		},
		timeout: 5000
	} );
	
	if ( !result.data ) {
		throw result.message;
	}
	
	return toCamelCase( result );
}

export async function verifyLtoken( ltoken: string, ltuid: string ): Promise<ResponseBody<ApiType.VerifyLtoken>> {
	const params = {
		t: Date.now()
	};
	const cookie = `ltoken=${ ltoken }; ltuid=${ ltuid };`;
	const { data: result } = await $https.FETCH_VERIFY_LTOKEN.post( params, {
		headers: {
			...HEADERS,
			Referer: "https://bbs.mihoyo.com/",
			cookie: cookie
		},
		timeout: 5000
	} );
	if ( !result.data ) {
		throw result.message;
	}
	return toCamelCase( result );
}


export async function getLTokenBySToken( stoken: string, mid: string ): Promise<ResponseBody<ApiType.GetLtoken>> {
	const cookie = `stoken=${ stoken }; mid=${ mid };`;
	
	const { data: result } = await $https.FETCH_GET_LTOKEN_BY_STOKEN.get( {}, {
		headers: {
			...HEADERS,
			cookie: cookie,
			DS: getDS( undefined, undefined )
		},
		timeout: 5000
	} );
	if ( !result.data ) {
		throw result.message;
	}
	return toCamelCase( result );
	
}