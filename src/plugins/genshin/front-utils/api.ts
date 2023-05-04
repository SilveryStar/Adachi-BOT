import { register, FetchServer } from "@/utils/request";

const apis = {
	CARD: "/card",
	ARTIFACT: "/artifact",
	WISH_RESULT: "/wish/result",
	WISH_STATISTIC: "/wish/statistic",
	WISH_CONFIG: "/wish/config",
	INFO: "/info",
	NOTE: "/note",
	CHAR: "/char",
	ABYSS: "/abyss",
	ABYSS_SINGLE: "/abyss/single",
	DAILY: "/daily",
	ALMANAC: "/almanac",
	LEDGER: "/ledger"
}

const { request, server } = register( {
	baseURL: "/genshin/api",
	responseType: "json",
	timeout: 60000
}, apis );

// 设置响应拦截
server.interceptors.response.use( resp => {
	return Promise.resolve( resp.data );
} );

export default <FetchServer<keyof typeof apis, any>><unknown>request;