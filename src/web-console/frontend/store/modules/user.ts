import { defineStore } from "pinia";
import { Md5 } from "md5-typescript";
import $http, { FetchResponse } from "&/api";
import { tokenSession } from "&/utils/session";

export const useUserStore = defineStore( "user", {
	actions: {
		async USER_LOGIN( number, password ) {
			if ( number?.length === 0 || password?.length === 0 ) {
				throw new Error( "账号或密码不可为空" );
			}
			const pwd = Md5.init( password );
			try {
				const res: FetchResponse<string> = await $http.USER_LOGIN.post( { num: number, pwd: pwd } );
				tokenSession.set( res.data );
				return res;
			} catch ( error ) {
				throw new Error( "账号或密码不正确" );
			}
		},
		async USER_LOGOUT() {
			tokenSession.remove();
		}
	}
} );