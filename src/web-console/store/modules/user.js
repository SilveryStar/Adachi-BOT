import $http from "../../api/index.js";
import { tokenSession } from "../../utils/session.js";

export function useUserStore() {
	async function USER_LOGIN( number, password ) {
		if ( number?.length === 0 || password?.length === 0 ) {
			throw new Error( "账号或密码不可为空" );
		}
		const pwd = md5( password );
		try {
			const res = await $http.USER_LOGIN( { num: number, pwd: pwd } );
			tokenSession.set( res.token );
			return res;
		} catch ( error ) {
			throw new Error( "账号或密码不正确" );
		}
	}
	
	async function USER_LOGOUT() {
		tokenSession.remove();
	}
	
	return {
		USER_LOGIN,
		USER_LOGOUT
	};
}