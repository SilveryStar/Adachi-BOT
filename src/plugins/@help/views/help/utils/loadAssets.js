export function loadCss( url ) {
	const link = document.createElement( "link" );
	link.rel = "stylesheet";
	link.href = url;
	document.head.appendChild( link );
}