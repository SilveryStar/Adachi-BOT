function isNumber( str: string ): boolean {
	return !isNaN( Number( str ) );
}

export function deepParse( json: any ) {
	if ( typeof json === "string" ) {
		if ( isNumber( json ) ) {
			return parseInt( json );
		}
		try {
			return deepParse( JSON.parse( json ) );
		} catch ( err ) {
			return json;
		}
	} else if ( Array.isArray( json ) ) {
		return json.map( val => deepParse( val ) );
	} else if ( typeof json === "object" && json !== null ) {
		return Object.keys( json ).reduce(
			( pre, cur ) => {
				const value = json[cur];
				pre[cur] = isNumber( value ) ? value : deepParse( value );
				return pre;
			}, {}
		);
	} else {
		return json;
	}
}