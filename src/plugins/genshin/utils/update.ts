import { getWishDetail, getWishList } from "./api";
import { WishDetail, WishInfo } from "../module/wish";

function pack( data: any ): WishInfo {
	return {
		type: data.item_type,
		name: data.item_name,
		rank: data.rank
	};
}

async function parser( wishID: number ): Promise<WishDetail> {
	const data: any = await getWishDetail( wishID );
	const info: WishDetail = {
		type: parseInt( data.gacha_type ),
		upFourStar: [],
		upFiveStar: [],
		nonUpFourStar: [],
		nonUpFiveStar: [],
		threeStar: []
	};
	
	data.r4_prob_list.forEach( ( el ) => {
		const parsed: WishInfo = pack( el );
		if ( el.is_up === 0 ) {
			info.nonUpFourStar.push( parsed );
		} else {
			info.upFourStar.push( parsed );
		}
	} );
	data.r5_prob_list.forEach( ( el ) => {
		const parsed: WishInfo = pack( el );
		if ( el.is_up === 0 ) {
			info.nonUpFiveStar.push( parsed );
		} else {
			info.upFiveStar.push( parsed );
		}
	} );
	data.r3_prob_list.forEach( ( el ) => {
		const parsed: WishInfo = pack( el );
		info.threeStar.push( parsed );
	} );
	
	return info;
}

function getWishID( wishData: any, wishType: number ): number {
	const wish = wishData.filter( el => el.gacha_type === wishType );
	let maxTime: number = 0;
	let tempWish: any;
	
	for ( let w of wish ) {
		const date = new Date( w.begin_time );
		if ( date.getTime() > maxTime ) {
			maxTime = date.getTime();
			tempWish = w;
		}
	}
	
	return tempWish.gacha_id;
}

async function updateWish(): Promise<WishDetail[]> {
	return new Promise( async ( resolve ) => {
		const wishData: any = ( await getWishList() ).data.list;
		
		const indefinite: WishDetail = await parser( wishData[0].gacha_id );
		const character: WishDetail  = await parser( getWishID( wishData, 301 ) );
		const weapon: WishDetail     = await parser( getWishID( wishData, 302 ) );
		
		resolve( [ indefinite, character, weapon ] );
	} );
}

export { updateWish }