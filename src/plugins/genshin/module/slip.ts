import bot from "ROOT";
import { randomInt } from "../utils/random";
import { getSlip } from "../utils/api";

export interface SlipDetail {
	SlipInfo: string[];
}

export class Slip {
	private readonly dbKey: string;
	private readonly SlipDetail: SlipDetail;
	private readonly detailLength: number;
	
	constructor( id: number, detail: SlipDetail ) {
		this.dbKey = `by-ha.slip-${ id }`;
		this.detailLength = detail.SlipInfo.length;
		this.SlipDetail = { SlipInfo: [] };
		
		for ( let s of detail.SlipInfo ) {
			this.SlipDetail.SlipInfo.push( Buffer.from( s, "base64" ).toString() );
		}
	}
	
	private static getDay(): string {
		const date = new Date();
		return date.toISOString().substring( 0, 10 );
	}
	
	public async get() {
		const today: string = Slip.getDay();
		const lastSlipData = ( await bot.redis.getString( this.dbKey ) )?.split( "|" );
		if ( lastSlipData !== undefined && lastSlipData[0] === today ) {
			return lastSlipData[1];
		}
		const slipContent = this.SlipDetail.SlipInfo[ randomInt( 0, this.detailLength ) ];
		await bot.redis.setString( this.dbKey, `${ today }|${ slipContent }` );
		
		return slipContent;
	}
}

export class SlipClass {
	private SlipDetail: SlipDetail = { SlipInfo: [] };
	
	constructor() {
		getSlip().then( ( data: SlipDetail ) => {
			this.SlipDetail = data;
		} );
	}
	
	public async get( qqID: number ): Promise<string> {
		const slip: Slip = new Slip( qqID, this.SlipDetail );
		return await slip.get();
	}
}