import apis from "./api";
import { FetchServer, register } from "@/utils/request";
import { loginInfoSession, tokenSession } from "&/utils/session";
import { ElNotification } from "element-plus";
import router from "&/router";

export type FetchResponse<D = any> = {
	code: number;
	data: D;
	msg?: string;
	total?: number;
}

const { server, request } = register( {
	baseURL: "/api",
	responseType: "json",
	timeout: 60000,
	headers: {
		'Content-Type': 'application/json;charset=UTF-8'
	}
}, apis );

server.interceptors.request.use( config => {
	const token = tokenSession.get();
	if ( token ) {
		config.headers.authorization = `Bearer ${ token }`;
	}
	return config;
} );

server.interceptors.response.use( resp => {
	return Promise.resolve( resp.data );
}, error => {
	if ( error.response?.status === 401 ) {
		loginInfoSession.remove();
		tokenSession.remove();
		router.push( { name: "Login" } );
	}
	const errMsg = error.response?.data?.msg;
	if ( errMsg ) {
		ElNotification( {
			title: "错误",
			message: errMsg,
			type: "error",
			duration: 2000
		} );
		return Promise.reject( new Error( errMsg ) );
	}
	return Promise.reject( error );
} );

export default <FetchServer<keyof typeof apis, FetchResponse>><unknown>request;