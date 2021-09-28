import { camelCase } from "lodash";

export function toCamelCase( obj: any ): any {
	if ( Array.isArray( obj ) ) {
		return obj.map( el => toCamelCase( el ) );
	} else if ( obj !== null && typeof obj === "object" ) {
		return Object.keys( obj ).reduce( ( prev, cur ) => ( {
			...prev,
			[camelCase( cur )]: toCamelCase( obj[cur] )
		} ), {} );
	}
	
	return obj;
}