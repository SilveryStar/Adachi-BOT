import { isJsonString } from "./validate.js";

/* token */
const tokenKey = "token";
export const tokenSession = {
	get: () => localStorage.getItem( tokenKey ) || "",
	set: token => localStorage.setItem( tokenKey, token ),
	remove: () => localStorage.removeItem( tokenKey )
}

/* 记住密码 */
const userInfoKey = "loginInfo";
export const loginInfoSession = {
	get: () => {
		const loginInfo = localStorage.getItem( userInfoKey );
		return isJsonString( loginInfo ) ? JSON.parse( loginInfo ) : null;
	},
	set: userInfo => localStorage.setItem( userInfoKey, JSON.stringify( userInfo ) ),
	remove: () => localStorage.removeItem( userInfoKey )
}

/* 群发消息cd */
const batchMsgKey = "batchMsg";
export const batchMsgSession = {
	get: () => localStorage.getItem( batchMsgKey ) || "",
	set: time => localStorage.setItem( batchMsgKey, time ),
	remove: () => localStorage.removeItem( batchMsgKey )
}