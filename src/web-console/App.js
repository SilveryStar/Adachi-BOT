import router from "./router/index.js";

const { defineComponent, ref, onBeforeMount, onUnmounted } = Vue;

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
	template: "<router-view :isMobile='isMobile' />",
	setup() {
		const isMobile = ref( false );
		
		function onLayoutResize() {
			/* 移动端地址栏问题 */
			document.documentElement.style.setProperty( "--app-height", `${ window.innerHeight }px` );
			isMobile.value = window.innerWidth <= 768;
		}
		
		onBeforeMount( () => {
			window.addEventListener( "resize", onLayoutResize );
			onLayoutResize();
		} )
		
		onUnmounted( () => {
			window.removeEventListener( "resize", onLayoutResize );
		} );
		
		return { isMobile };
	}
} );