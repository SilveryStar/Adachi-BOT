import moment from "moment";
import bot from "ROOT";
import { randomInt } from "../utils/random";
import { getSlip } from "../utils/api";

export interface SlipDetail {
	SlipInfo: string[];
}

export class SlipClass {
	private slip: string[] = [];
	private slipNum: number = 0;
	
	constructor() {
		getSlip().then( ( data: SlipDetail ) => {
			this.slipNum = data.SlipInfo.length;
			for ( let el of data.SlipInfo ) {
				this.slip.push( Buffer.from( el, "base64" ).toString() );
			}
		} );
	}
	
	public async get( userID: number ): Promise<string> {
		const dbKey: string = `by-ha.slip-save-${ userID }`;
		const today: string = moment().format( "yy-MM-DD" );
		
		const data: Record<string, string> = await bot.redis.getHash( dbKey );
		if ( data.today && data.today === today ) {
			return data.slip;
		}
		
		const slip: string = this.slip[ randomInt( 0, this.slipNum - 1 ) ];
		await bot.redis.setHash( dbKey, { today, slip } );
		return slip;
	}
}