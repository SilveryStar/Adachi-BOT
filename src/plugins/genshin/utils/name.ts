import { aliasClass } from "../init";
import { fuzzyMatch, MatchResult } from "./fuzzy-match";

export interface NameResult {
	definite: boolean;
	info: string | string[];
}

export function getRealName( name: string ): NameResult {
	const aliasSearchResult: string | undefined = aliasClass.search( name );
	if ( aliasSearchResult !== undefined ) {
		return { definite: true, info: aliasSearchResult };
	}
	
	const fuzzyMatchResult: Array<MatchResult> = fuzzyMatch( name );
	if ( fuzzyMatchResult.length === 0 ) {
		return { definite: false, info: "" };
	} else if ( fuzzyMatchResult[0].ratio >= 0.98 ) {
		return { definite: true, info: fuzzyMatchResult[0].content };
	} else {
		return { definite: false, info: fuzzyMatchResult.map( el => el.content ) };
	}
}