export function parseURL( url ) {
	let urlParams = url.substring( 1 ).split( "&" );
	let result = {};
	for ( let p of urlParams ) {
		const [ key, value ] = p.split( "=" );
		result[ key ] = value;
	}
	return result;
}

export function request( url ) {
	const Http = new XMLHttpRequest();
	Http.open( "GET", url, false );
	Http.send();
	return JSON.parse( Http.responseText );
}