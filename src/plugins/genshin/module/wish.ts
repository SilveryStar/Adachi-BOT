import { scheduleJob } from "node-schedule";
import { updateWish } from "../utils/update";
import { randomInt } from "../utils/random";
import { Redis } from "../../../bot";

interface WishResult {
	type: string;
	name: string;
	rank: number;
	times?: number;
}

interface WishInfo {
	type: string;
	name: string;
	rank: number;
}

interface WishDetail {
	type: number;
	upFourStar: WishInfo[];
	upFiveStar: WishInfo[];
	nonUpFourStar: WishInfo[];
	nonUpFiveStar: WishInfo[];
	threeStar: WishInfo[];
}

export type WishDetailNull = WishDetail | null;
type probFn = ( counter: number, rank: number ) => number;

class Wish {
	/* 数据参考: https://www.bilibili.com/read/cv10468091
	   更新时间: 2021年6月16日15:57:34, 不保证概率更新的及时性 */
	public static indefiniteOrCharacter( counter: number, rank: number ): number {
		switch ( true ) {
			case rank === 5 && counter <= 73:
				return 60;
			case rank === 5 && counter >= 74:
				return 60 + 600 * ( counter - 73 );
			case rank === 4 && counter <= 8:
				return 510;
			case rank === 4 && counter >= 9:
				return 510 + 5100 * ( counter - 8 );
			default:
				return 0;
		}
	}
	
	public static weapon( counter: number, rank: number ): number {
		switch ( true ) {
			case rank === 5 && counter <= 62:
				return 70;
			case rank === 5 && counter <= 73:
				return 70 + 700 * ( counter - 62 );
			case rank === 5 && counter >= 74:
				return 7770 + 350 * ( counter - 73 );
			case rank === 4 && counter <= 7:
				return 600;
			case rank === 4 && counter === 8:
				return 6600;
			case rank === 4 && counter >= 9:
				return 6600 + 3000 * ( counter - 8 );
			default:
				return 0;
		}
	}
	
	private static getRandom( max: number = 1e4 ): number {
		return randomInt( 1, max );
	}
	
	private readonly probFunc: probFn;
	private readonly table: WishDetail;
	private readonly type: string;
	private readonly dbKey: string;
	
	constructor( fn: probFn, table: WishDetail, type: string, id: number ) {
		this.probFunc = fn;
		this.table = table;
		this.type = type;
		this.dbKey = `silvery-star.wish-${ type }-${ id }`;
	}
	
	private async SET( field: string, value: any ): Promise<void> {
		await Redis.client.HSET( this.dbKey, field, value );
	}

	private async GET( filed: string ): Promise<number> {
		return new Promise( ( resolve ) => {
			Redis.client.HGET( this.dbKey, filed, ( error: Error | null, res: string ) => {
				resolve( parseInt( res ) );
			} );
		} );
	}
	
	private async INCREASE( field: string ): Promise<void> {
		await Redis.client.HINCRBY( this.dbKey, field, 1 );
	}
	
	private async updateCounter( rank: number, up: boolean ): Promise<void> {
		if ( rank !== 5 ) {
			await this.INCREASE( "five" );
			rank === 4 ? await this.SET( "four", 1 )
					   : await this.INCREASE( "four" );
			return;
		}
		await this.SET( "five", 1 );
		await this.INCREASE( "four" );
		if ( this.type === "character" ) {
			await this.SET( "isUp", up ? 0 : 1 );
		}
	}
	
	private async getRank(): Promise<number> {
		const value: number = Wish.getRandom();
		const fiveProb: number = this.probFunc( await this.GET( "five" ), 5 );
		const fourProb: number = this.probFunc( await this.GET( "four" ), 4 ) + fiveProb;
		
		switch ( true ) {
			case value <= fiveProb:
				return 5;
			case value <= fourProb:
				return 4;
			default:
				return 3
		}
	}
	
	private async getIsUp( rank: number ): Promise<boolean> {
		if ( this.type === "indefinite" ) {
			return false;
		} else if ( this.type === "weapon" ) {
			return Wish.getRandom() <= 7500;
		} else {
			const isUp: number = await this.GET( "isUp" );
			return Wish.getRandom() <= 5000 || ( rank === 5 && isUp === 1 );
		}
	}
	
	private async once(): Promise<WishResult> {
		const rank: number = await this.getRank();
		const up: boolean = await this.getIsUp( rank );
		const times: number = await this.GET( "five" );
		await this.updateCounter( rank, up );
		
		let result: WishResult;
		
		if ( rank === 5 ) {
			if ( up ) {
				const idx: number = Wish.getRandom( this.table.upFiveStar.length ) - 1;
				result = this.table.upFiveStar[idx];
			} else {
				const idx: number = Wish.getRandom( this.table.nonUpFiveStar.length ) - 1;
				result = this.table.nonUpFiveStar[idx];
			}
			return { ...result, times };
		} else if ( rank === 4 ) {
			if ( up ) {
				const idx: number = Wish.getRandom( this.table.upFourStar.length ) - 1;
				return this.table.upFourStar[idx];
			} else {
				const idx: number = Wish.getRandom( this.table.nonUpFourStar.length ) - 1;
				return this.table.nonUpFourStar[idx];
			}
		} else {
			const idx: number = Wish.getRandom( this.table.threeStar.length ) - 1;
			return this.table.threeStar[idx];
		}
	}
	
	public async tenTimes(): Promise<WishResult[]> {
		let result: WishResult[] = [];
		for ( let i = 0; i < 10; i++ ) {
			result.push( await this.once() );
		}
		
		return result;
	}
}

class WishClass {
	private indefinite?: WishDetailNull;
	private character?: WishDetailNull;
	private weapon?: WishDetailNull;
	
	constructor() {
		updateWish().then( ( data: WishDetailNull[] ) => {
			[ this.indefinite, this.character, this.weapon ] = data;
		} );
		scheduleJob( "0 31 10 * * *", async () => {
			[ this.indefinite, this.character, this.weapon ] = await updateWish();
		} );
		scheduleJob( "0 1 18 * * *", async () => {
			[ this.indefinite, this.character, this.weapon ] = await updateWish();
		} );
	}
	
	public async get( qqID: number, choice: string ): Promise<WishResult[] | null> {
		let fn: probFn;
		let table: WishDetail;
		let wishType: string;
		
		if ( choice === "常驻" ) {
			fn = Wish.indefiniteOrCharacter;
			table = this.indefinite as WishDetail;
			wishType = "indefinite";
		} else if ( choice === "角色" ) {
			fn = Wish.indefiniteOrCharacter;
			table = this.character as WishDetail;
			wishType = "character";
		} else {
			fn = Wish.weapon;
			table = this.weapon as WishDetail;
			wishType = "weapon";
		}
		if ( table === null ) {
			return null;
		}

		const wish: Wish = new Wish( fn, table, wishType, qqID );
		return await wish.tenTimes();
	}
}

export { WishClass, WishResult, WishDetail, WishInfo }