import router from "./router/index.js";

const { defineComponent } = Vue;

axios.interceptors.request.use( config => {
	const token = localStorage.getItem( "token" );
	if ( token ) {
		config.headers.authorization = `Bearer ${ token }`;
	}
	return config;
} );

axios.interceptors.response.use( resp => {
	return Promise.resolve( resp );
}, error => {
	if ( error.response && error.response.status === 401 ) {
		localStorage.removeItem( "token" );
		router.push( { name: "Login" } );
	}
	return Promise.reject( error );
} );

export default defineComponent( {
	name: "App",
	template: "<router-view />"
} );