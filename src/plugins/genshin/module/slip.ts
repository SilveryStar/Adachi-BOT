import { Redis } from "../../../bot";
import { randomInt } from "../utils/random";

interface SlipDetail {
	SlipInfo: string[];
}

class Slip {
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
		const lastSlipData = ( await Redis.getString( this.dbKey ) )?.split( "|" );
		if ( lastSlipData !== undefined && lastSlipData[0] === today ) {
			return lastSlipData[1];
		}
		const slipContent = this.SlipDetail.SlipInfo[ randomInt( 0, this.detailLength ) ];
		await Redis.setString( this.dbKey, `${ today }|${ slipContent }` );
		
		return slipContent;
	}
}

class SlipClass {
	private readonly SlipDetail: SlipDetail;
	
	constructor( data: SlipDetail ) {
		this.SlipDetail = data;
	}
	
	public async get( qqID: number ): Promise<string> {
		const slip: Slip = new Slip( qqID, this.SlipDetail );
		return await slip.get();
	}
}

export { SlipClass }