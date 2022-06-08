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
	if ( error.response && error.response.status === 401 ) {
		localStorage.removeItem( "token" );
		router.push( { name: "Login" } );
	}
	return Promise.reject( error );
} );

export default server