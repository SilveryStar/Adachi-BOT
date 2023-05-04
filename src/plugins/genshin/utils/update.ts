import { getWishDetail, getWishList } from "./api";
import { WishDetail, WishInfo, WishDetailNull } from "#/genshin/module/wish";
import { WishOverview, WishProbItem } from "#/genshin/types";

export interface WishData {
	res: WishDetailNull[];
	weaponID: string;
}

function pack( data: WishProbItem ): WishInfo {
	return {
		type: data.itemType,
		name: data.itemName,
		rank: data.rank
	};
}

async function parser( wishID: string ): Promise<WishDetailNull> {
	if ( wishID.length === 0 ) {
		return null;
	}

	const data = await getWishDetail( wishID );
	const info: WishDetail = {
		type: data.gachaType,
		upFourStar: [],
		upFiveStar: [],
		nonUpFourStar: [],
		nonUpFiveStar: [],
		threeStar: []
	};

	data.r4ProbList.forEach( ( el ) => {
		const parsed: WishInfo = pack( el );
		if ( el.isUp === 0 ) {
			info.nonUpFourStar.push( parsed );
		} else {
			info.upFourStar.push( parsed );
		}
	} );
	data.r5ProbList.forEach( ( el ) => {
		const parsed: WishInfo = pack( el );
		if ( el.isUp === 0 ) {
			info.nonUpFiveStar.push( parsed );
		} else {
			info.upFiveStar.push( parsed );
		}
	} );
	data.r3ProbList.forEach( ( el ) => {
		const parsed: WishInfo = pack( el );
		info.threeStar.push( parsed );
	} );

	return info;
}

function getWishID( wishData: WishOverview[], wishType: number ): string {
	const wish = wishData
		.filter( el => el.gachaType === wishType )
		.sort( (prev, next) => new Date(next.beginTime).getTime() - new Date( prev.beginTime ).getTime() );

	return wish[0] ? wish[0].gachaId : "";
}

export async function updateWish(): Promise<WishData> {
	return new Promise( async ( resolve ) => {
		const wishData = ( await getWishList() ).data.list;

		const indefinite: WishDetailNull = await parser( wishData[0].gachaId );
		const character1: WishDetailNull = await parser( getWishID( wishData, 301 ) );
		const character2: WishDetailNull = await parser( getWishID( wishData, 400 ) );
		
		const weaponID: string = getWishID( wishData, 302 );
		const weapon: WishDetailNull = await parser( weaponID );

		resolve( {
			res: [ indefinite, character1, weapon, character2 ],
			weaponID
		} );
	} );
}