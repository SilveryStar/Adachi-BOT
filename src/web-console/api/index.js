import server from "./request.js";
import apis from "./api.js";

const ajax = {};
const getRequest = [ "GET", "DELETE" ];

function getServer( url, params = {}, method = "POST", config = {} ) {
	const paramsField = getRequest.includes( method ) ? "params" : "data"
	const serverConfig = {
		url,
		method,
		[paramsField]: params,
		...config
	}
	return server( serverConfig )
}

for ( const api in apis ) {
	ajax[api] = ( params = {}, method = "POST", config = {} ) => {
		return getServer( apis[api], params, method, config )
	}
}

export default ajax