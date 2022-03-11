import bot from "ROOT";
import { updateWish, WishData } from "../utils/update";
import { scheduleJob } from "node-schedule";
import { randomInt } from "../utils/random";
import { wishClass } from "#genshin/init";

export interface WishResult {
	type: string;
	name: string;
	rank: number;
	times?: number;
}

export interface WishTotalSet {
	result: WishResult[];
	total: number;
}

export interface WishInfo {
	type: string;
	name: string;
	rank: number;
}

export interface WishDetail {
	type: number;
	upFourStar: WishInfo[];
	upFiveStar: WishInfo[];
	nonUpFourStar: WishInfo[];
	nonUpFiveStar: WishInfo[];
	threeStar: WishInfo[];
}

export interface DBEpitData {
	id?: string;
	set?: string;
}

export type WishDetailNull = WishDetail | null;
export type checkFn = ( res: WishResult ) => boolean;
type probFn = ( counter: number, rank: number ) => number;
type wishMethod = [ probFn, WishDetail, string ];

export class EpitomizedPath {
	static async getUser( dbKey: string ): Promise<number> {
		const nowWeaponID: string = wishClass.getWeaponID();
		const epit: DBEpitData = await bot.redis.getHash( dbKey );
		if ( epit.id === undefined || epit.id !== nowWeaponID ) {
			epit.id = nowWeaponID;
			epit.set = "0";
		}
		
		return parseInt( <string>epit.set );
	}
}

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
	private readonly epit: string;
	private tempData: Record<string, number> = {};
	
	constructor( fn: probFn, table: WishDetail, type: string, id: number ) {
		this.probFunc = fn;
		this.table = table;
		this.type = type;
		this.dbKey = `silvery-star.wish-${ type }-${ id }`;
		this.epit = `silvery-star.epitomized-path-${ id }`;
	}
	
	public async init(): Promise<Wish> {
		const data: Record<string, string> = await bot.redis.getHash( this.dbKey );
		if ( !data.epit ) {
			await bot.redis.setHash( this.dbKey, { epit: 0 } );
		}
		this.tempData = Object.keys( data )
			.reduce( ( pre, cur ) => {
				const num: string = data[cur];
				pre[cur] = num === "NaN" ? 0 : parseInt( num );
				return pre;
			}, {} );
		return this;
	}
	
	private SET( field: string, value: any ): void {
		this.tempData[field] = value;
	}
	
	private GET( filed: string ): number {
		return this.tempData[filed];
	}
	
	private INCREASE( field: string ): void {
		this.tempData[field]++;
	}
	
	private async WRITE(): Promise<void> {
		await bot.redis.setHash( this.dbKey, this.tempData );
	}
	
	private async updateCounter( rank: number, up: boolean ): Promise<void> {
		if ( rank !== 5 ) {
			this.INCREASE( "five" );
			rank === 4 ? this.SET( "four", 1 )
				: this.INCREASE( "four" );
			return;
		}
		this.SET( "five", 1 );
		this.INCREASE( "four" );
		if ( this.type !== "indefinite" ) {
			this.SET( "isUp", up ? 0 : 1 );
		}
	}
	
	private async getRank(): Promise<number> {
		const value: number = Wish.getRandom();
		const fiveProb: number = this.probFunc( this.GET( "five" ), 5 );
		const fourProb: number = this.probFunc( this.GET( "four" ), 4 ) + fiveProb;
		
		switch ( true ) {
			case value <= fiveProb:
				return 5;
			case value <= fourProb:
				return 4;
			default:
				return 3
		}
	}
	
	private async getEpit(): Promise<number> {
		return this.GET( "epit" );
	}
	
	private async getIsUp( rank: number ): Promise<boolean> {
		if ( this.type === "indefinite" ) {
			return false;
		} else if ( this.type === "weapon" ) {
			const isUp: number = this.GET( "isUp" );
			return Wish.getRandom() <= 7500 || ( rank === 5 && isUp === 1 );
		} else {
			const isUp: number = this.GET( "isUp" );
			return Wish.getRandom() <= 5000 || ( rank === 5 && isUp === 1 );
		}
	}
	
	private async once( mark: boolean = true ): Promise<WishResult> {
		const rank: number = await this.getRank();
		const up: boolean = await this.getIsUp( rank );
		const times: number = this.GET( "five" );
		await this.updateCounter( rank, up );
		
		let result: WishResult;
		
		if ( rank === 5 ) {
			/* 判断武器定轨 */
			if ( this.type === "weapon" ) {
				const epit: number = await this.getEpit();
				const user: number = await EpitomizedPath.getUser( this.epit );
				if ( mark && epit >= 2 && user !== 0 ) {
					this.SET( "epit", 0 );
					const result = this.table.upFiveStar[user - 1];
					return { ...result, times, rank: 105 };
				}
				this.INCREASE( "epit" );
			}
			if ( up ) {
				const idx: number = Wish.getRandom( this.table.upFiveStar.length ) - 1;
				result = this.table.upFiveStar[idx];
				/* 如果抽中定轨武器，则清空命定值 */
				if ( this.type === "weapon" ) {
					const user: number = await EpitomizedPath.getUser( this.epit );
					if ( mark && user !== 0 ) {
						const chosen = this.table.upFiveStar[user - 1];
						if ( result.name === chosen.name ) {
							this.SET( "epit", 0 );
							return { ...result, times, rank: 105 };
						}
					}
				}
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
	
	public async getAnyTimes( t: number ): Promise<WishTotalSet> {
		const result: WishResult[] = [];
		const mark: boolean = t !== 10;
		
		for ( let i = 0; i < t; i++ ) {
			result.push( await this.once( mark ) );
		}
		await this.WRITE();
		return { result, total: t };
	}
	
	public async getUntil( chk: checkFn ): Promise<WishTotalSet> {
		let res: WishResult;
		let total: number = 0;
		
		const result: WishResult[] = [];
		do {
			total++;
			res = await this.once();
			result.push( res );
		} while ( !chk( res ) || total >= 500 );
		await this.WRITE();
		
		return { result, total };
	}
}

export class WishClass {
	private indefinite?: WishDetailNull;
	private character?: WishDetailNull;
	private weapon?: WishDetailNull;
	private character2?: WishDetailNull;
	private weaponID?: string;
	
	constructor() {
		updateWish().then( ( data: WishData ) => {
			[ this.indefinite, this.character, this.weapon, this.character2 ] = data.res;
			this.weaponID = data.weaponID;
		} );
		scheduleJob( "0 31 10 * * *", async () => {
			const data: WishData = await updateWish();
			[ this.indefinite, this.character, this.weapon, this.character2 ] = data.res;
			this.weaponID = data.weaponID;
		} );
		scheduleJob( "0 1 18 * * *", async () => {
			const data: WishData = await updateWish();
			[ this.indefinite, this.character, this.weapon, this.character2 ] = data.res;
			this.weaponID = data.weaponID;
		} );
	}
	
	private getWishMethod( choice: string ): wishMethod | undefined {
		let fn: probFn = Wish.indefiniteOrCharacter;
		let table: WishDetail;
		let wishType: string;
		
		switch ( choice ) {
			case "常驻":
				table = <WishDetail>this.indefinite;
				wishType = "indefinite";
				break;
			case "角色":
				table = <WishDetail>this.character;
				wishType = "character";
				break;
			case "角色2":
				table = <WishDetail>this.character2;
				wishType = "character";
				break;
			default:
				fn = Wish.weapon;
				table = <WishDetail>this.weapon;
				wishType = "weapon";
		}
		if ( table === null ) {
			return undefined;
		}
		return [ fn, table, wishType ];
	}
	
	private async getCheckFn( method: wishMethod, userID: number ): Promise<checkFn> {
		if ( method[2] === "weapon" ) {
			const epitKey: string = `silvery-star.epitomized-path-${ userID }`;
			const user: number = await EpitomizedPath.getUser( epitKey );
			if ( user === 0 ) {
				return ( res: WishResult ) => res.rank === 5;
			} else {
				const up: WishInfo = method[1].upFiveStar[user - 1];
				return ( res: WishResult ) => res.name === up.name;
			}
		} else if ( method[2] === "character" ) {
			const up: WishInfo = method[1].upFiveStar[0];
			return ( res: WishResult ) => res.name === up.name;
		} else {
			return ( res: WishResult ) => res.rank === 5;
		}
	}
	
	public async get( userID: number, choice: string, param: string ): Promise<WishTotalSet | null> {
		const method = this.getWishMethod( choice );
		if ( method ) {
			const wish: Wish = await new Wish( ...method, userID ).init();
			switch ( true ) {
				case param.length === 0:
					return await wish.getAnyTimes( 10 );
				case /^\d+$/.test( param ):
					return await wish.getAnyTimes( parseInt( param ) * 10 );
				case param === "until":
					const check = await this.getCheckFn( method, userID );
					return await wish.getUntil( check );
			}
		}
		return null;
	}
	
	public getUpWeapon(): string[] | undefined {
		return this.weapon?.upFiveStar.map( el => el.name );
	}
	
	public getWeaponID(): string {
		return <string>this.weaponID;
	}
}