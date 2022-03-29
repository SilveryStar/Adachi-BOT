import router from "../router/index.js";

const server = axios.create( {
	baseURL: "/api",
	responseType: "json",
	timeout: 60000,
	headers: {
		'Content-Type': 'application/json;charset=UTF-8'
	}
} )

server.interceptors.request.use( config => {
	const token = localStorage.getItem( "token" );
	if ( token ) {
		config.headers.authorization = `Bearer ${ token }`;
	}
	return config;
} );

server.interceptors.response.use( resp => {
	return Promise.resolve( resp );
}, error => {
	if ( error.response && error.response.status === 401 ) {
		localStorage.removeItem( "token" );
		router.push( { name: "Login" } );
	}
	return Promise.reject( error );
} );

export default server