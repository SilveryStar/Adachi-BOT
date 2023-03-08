/**
 Author: Extrwave
 CreateTime: 2023/1/7
 */

/**
 * @interface
 * Stoken获取Cookie_Token
 * @uid 米游社ID
 * @cookieToken 所需数据Token
 */
export interface CookieToken {
	type: "cookie-token",
	uid: string,
	cookieToken: string
}

/**
 * @interface
 * Login_Ticket获取Stoken和Ltoken
 * @list token列表
 */
export interface MutiTokenResult {
	type: "multi-token",
	list: {
		"name": string,
		"token": string
	}[]
}

/**
 * @interface
 * 根据Ltoken获取Mid
 * @userInfo 所需数据
 */

export interface VerifyLtoken {
	type: "verify-ltoken",
	userInfo: UserInfo
}

export interface UserInfo {
	aid: string, //相当于MysID
	mid: string,
	account_name: string,
	email: string,
	is_email_verify: number,
	area_code: string,
	mobile: string,
	safe_area_code: string,
	safe_mobile: string,
	realname: string,
	identity_code: string,
	rebind_area_code: string,
	rebind_mobile: string,
	rebind_mobile_time: string,
	links: any[]
}

/**
 * @interface
 * 根据Stoken获取Ltoken
 */
export interface GetLtoken {
	type: "get-ltoken",
	ltoken: string
}