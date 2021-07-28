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
		const lastSlip = await Redis.getString( this.dbKey );
		if ( lastSlip === today ) {
			return "今天已经摇过了。明天再来看看吧…";
		}
		await Redis.setString( this.dbKey, today );
		const index = randomInt( 0, this.detailLength );
		
		return this.SlipDetail.SlipInfo[index];
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