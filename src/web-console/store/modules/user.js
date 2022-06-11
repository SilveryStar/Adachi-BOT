import $http from "../../api/index.js"
import { tokenSession } from "../../utils/session.js";

export function useUserStore() {
	async function USER_LOGIN( number, password ) {
		return new Promise( ( resolve, reject ) => {
			if ( number?.length === 0 || password?.length === 0 ) {
				reject( new Error( "账号或密码不可为空" ) );
			}
			const pwd = md5( password );
			$http.USER_LOGIN( { num: number, pwd: pwd } ).then( res => {
				tokenSession.set( res.token );
				resolve( res );
			} ).catch( () => {
				reject( new Error( "账号或密码不正确" ) );
			} );
		} )
	}
	
	async function USER_LOGOUT() {
		return new Promise( resolve => {
			tokenSession.remove();
			resolve();
		} )
	}
	
	return {
		USER_LOGIN,
		USER_LOGOUT
	};
}