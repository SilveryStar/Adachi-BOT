import { register, FetchServer } from "@/utils/request";

const apis = {
	HELP: "/help"
}

const { request, server } = register( {
	baseURL: "/@help/api",
	responseType: "json",
	timeout: 60000
}, apis );

// 设置响应拦截
server.interceptors.response.use( resp => {
	return Promise.resolve( resp.data );
} );

export default <FetchServer<keyof typeof apis, any>><unknown>request;