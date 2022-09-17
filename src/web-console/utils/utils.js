function getPathList( path, ignore ) {
	let pathList = path.split( "." );
	if ( ignore && typeof ignore === "number" ) {
		const firstItem = pathList.splice( 0, ignore + 1 ).join( "." );
		return [ firstItem, ...pathList ];
	}
	return pathList;
}

export function objectGet( object, path, ignore ) {
	return getPathList( path, ignore ).reduce( ( o, k ) => ( o || {} )[k], object );
}

export function objectSet( object, path, value, ignore ) {
	getPathList( path, ignore ).reduce( ( o, k, i, arr ) => {
		if ( i === arr.length - 1 ) {
			o[k] = value;
		} else {
			o[k] = {};
			return o[k];
		}
	}, object );
}