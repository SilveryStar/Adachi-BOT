import { diffChars } from "diff";

export interface MatchResult {
	content: string;
	ratio: number;
}

function similarity( first: string, second: string ): number {
	const diff = diffChars( first, second );
	
	const T = first.length + second.length;
	const M = diff.reduce( ( prev, cur ) => {
		if ( cur !== undefined && !cur.hasOwnProperty( "added" ) && !cur.hasOwnProperty( "removed" ) ) {
			// @ts-ignore
			return prev + cur.count;
		}
		return prev;
	}, 0 );

	return 2.0 * M / T;
}

export function fuzzyMatch( stringSet: string[], str: string, maxRetNum: number = 5 ): MatchResult[] {
	let result: Array<MatchResult> = [];
	for ( let el of stringSet ) {
		const ratio = similarity( str, el );
		result.push( { ratio, content: el } );
	}
	result = result.filter( el => el.ratio >= 0.75 )
		           .sort( ( x, y ) => y.ratio - x.ratio );
	return result.slice( 0, maxRetNum );
}