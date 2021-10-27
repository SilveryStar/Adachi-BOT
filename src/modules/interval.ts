import { botConfig, Redis } from "../bot";

class IntervalSetting {
	public globalLimit: number;
	public limitList: Record<number, number> = {};

	constructor( dbKey: string, limit: number ) {
		this.globalLimit = limit;
		Redis.getHash( dbKey ).then( res => this.limitList = res || {} );
	}
	
	public get( qqID: number ): number {
		return this.limitList[qqID] || this.globalLimit;
	}
}

export class Interval {
	private readonly unixTimeTemp: Record<number, number>;
	private readonly g: IntervalSetting;
	private readonly p: IntervalSetting;
	
	private readonly gDBKey: string = "adachi.group-interval";
	private readonly pDBKey: string = "adachi.private-interval";
	
	constructor() {
		this.unixTimeTemp = {};
		this.g = new IntervalSetting( this.gDBKey, botConfig.groupIntervalTime );
		this.p = new IntervalSetting( this.pDBKey, botConfig.privateIntervalTime );
	}
	
	public check( qqID: number, groupID: number ): boolean {
		const nowTime: number = new Date().getTime();
		const past: number = nowTime - ( this.unixTimeTemp[qqID] || 0 );

		/* groupID 为 -1 时，视为私聊进行处理 */
		const limit: number = groupID === -1
							? this.p.get( qqID )
							: this.g.get( groupID );
		if ( past <= limit ) {
			return false;
		} else {
			this.unixTimeTemp[qqID] = nowTime;
			return true;
		}
	}
	
	public async set( id: number, type: string, time: number ): Promise<void> {
		const key: string = type === "private"
						  ? this.pDBKey : this.gDBKey;
		await Redis.setHash( key, { [id]: time } );
		
		const setting = type === "private"
					  ? this.p : this.g;
		setting.limitList[id] = time;
	}
}