const { ElNotification } = ElementPlus;
import router from "../router/index.js";
import { tokenSession } from "../utils/session.js";

const server = axios.create( {
	baseURL: "/api",
	responseType: "json",
	timeout: 60000,
	headers: {
		'Content-Type': 'application/json;charset=UTF-8'
	}
} )

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
		localStorage.removeItem( "token" );
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

export default server