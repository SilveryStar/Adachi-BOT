import { defineStore } from "pinia";
import { Md5 } from "md5-typescript";
import $http, { FetchResponse } from "@/api";
import { tokenSession } from "@/utils/session";

export const useUserStore = defineStore( "user", () => {
	const USER_LOGIN = async ( username: string, password: string ) => {
		if ( username?.length === 0 || password?.length === 0 ) {
			throw new Error( "账号或密码不可为空" );
		}
		const pwd = Md5.init( password );
		try {
			const res: FetchResponse<string> = await $http.USER_LOGIN.post( { username, password: pwd } );
			tokenSession.set( res.data );
			return res;
		} catch {
		}
	}
	
	const USER_LOGOUT = async () => {
		tokenSession.remove();
	}
	
	return { USER_LOGIN, USER_LOGOUT }
} );