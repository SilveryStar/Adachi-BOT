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

export function getFullDate() {
	const date = new Date();
	let hour = date.getHours();
	let minute = date.getMinutes();
	let second = date.getSeconds();
	second = second < 10 ? "0" + second : second;
	minute = minute < 10 ? "0" + minute : minute;
	hour = hour < 10 ? "0" + hour : hour;
	
	return `${ date.getMonth() + 1 }月${ date.getDate() }日 ${ hour }:${ minute }:${ second }`;
}