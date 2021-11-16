import BotConfig from "@modules/config";
import Database from "@modules/database";

class IntervalSetting {
	public globalLimit: number;
	public limitList: Record<number, number> = {};

	constructor( redis: Database, dbKey: string, limit: number ) {
		this.globalLimit = limit;
		redis.getHash( dbKey ).then( res => {
			this.limitList = {};
			Object.keys( res ).forEach( el => {
				this.limitList[parseInt( el )] = parseInt( res[el] );
			} );
		} );
	}
	
	public get( userID: number ): number {
		return this.limitList[userID] || this.globalLimit;
	}
}

export default class Interval {
	private readonly unixTimeTemp: Record<number, number>;
	private readonly g: IntervalSetting;
	private readonly p: IntervalSetting;
	private readonly redis: Database;
	
	private readonly gDBKey: string = "adachi.group-interval";
	private readonly pDBKey: string = "adachi.private-interval";
	
	constructor( config: BotConfig, redis: Database ) {
		this.unixTimeTemp = {};
		this.g = new IntervalSetting( redis, this.gDBKey, config.groupIntervalTime );
		this.p = new IntervalSetting( redis, this.pDBKey, config.privateIntervalTime );
		this.redis = redis;
	}
	
	public check( userID: number, groupID: number ): boolean {
		const nowTime: number = new Date().getTime();
		const past: number = nowTime - ( this.unixTimeTemp[userID] || 0 );

		/* groupID 为 -1 时，视为私聊进行处理 */
		const limit: number = this.get( userID, groupID );
		if ( past <= limit ) {
			return false;
		} else {
			this.unixTimeTemp[userID] = nowTime;
			return true;
		}
	}
	
	public get( userID: number, groupID: number ): number {
		return groupID === -1 ? this.p.get( userID ) : this.g.get( groupID );
	}
	
	public async set( id: number, type: string, time: number ): Promise<void> {
		const key: string = type === "private"
						  ? this.pDBKey : this.gDBKey;
		await this.redis.setHash( key, { [id]: time } );
		
		const setting = type === "private"
					  ? this.p : this.g;
		setting.limitList[id] = time;
	}
}