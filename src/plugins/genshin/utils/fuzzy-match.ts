import { typeData } from "../init";

export interface MatchResult {
	content: string;
	ratio: number;
}

export function similarity( str1: string, str2: string, threshold = Infinity, limit = Infinity ): number {
	let str1Length: number = str1.length;
	let str2Length: number = str2.length;
	
	if ( Math.abs( str1Length - str2Length ) > limit ) {
		return 0;
	}
	
	if ( str1Length === 0 ) return str2Length > threshold ? 0 : 1;
	if ( str2Length === 0 ) return str1Length > threshold ? 0 : 1;
	
	if ( str1Length > str2Length ) {
		[ str1, str2 ] = [ str2, str1 ];
		[ str1Length, str2Length ] = [ str2Length, str1Length ];
	}
	
	const dp = Array.from( { length: str1Length + 1 }, () => 0 );
	
	for ( let i = 0; i <= str1Length; i++ ) {
		dp[i] = i;
	}
	
	for ( let j = 1; j <= str2Length; j++ ) {
		let prev = j - 1;
		let curr = prev + 1;
		for ( let i = 1; i <= str1Length; i++ ) {
			const temp = dp[i];
			if ( str1[i - 1] === str2[j - 1] ) {
				dp[i] = prev;
			} else {
				dp[i] = Math.min( prev, dp[i], dp[i - 1] ) + 1;
			}
			prev = temp;
			curr = dp[i];
		}
		if ( curr > threshold ) {
			return 0;
		}
	}
	
	return 1 - dp[str1Length] / Math.max( str1.length, str2.length );
}

export function fuzzyMatch( str: string, maxRetNum: number = 5 ): MatchResult[] {
	let result: MatchResult[] = [];
	const nameList: string[] = typeData.getNameList();
	
	for ( let el of nameList ) {
		const ratio = similarity( str, el );
		result.push( { ratio, content: el } );
	}
	result = result.filter( el => el.ratio >= 0.75 )
		           .sort( ( x, y ) => y.ratio - x.ratio );
	
	return result.slice( 0, maxRetNum );
}