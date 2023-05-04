import BotConfig from "@/modules/config";
import Database from "@/modules/database";

export type IntervalType = "private" | "group";

export interface IntervalSettingData {
	setting: IntervalSetting,
	prefix: string
}

class IntervalSetting {
	public dbKey: string;
	public globalLimit: number;
	public limitList: Record<string, string> = {};
	
	constructor( redis: Database, dbKey: string, limit: number ) {
		this.dbKey = dbKey;
		this.globalLimit = limit;
		redis.getHash( dbKey ).then( res => {
			this.limitList = { ...res };
		} );
	}
	
	public get( userID: number | string ): number {
		return this.limitList[userID] ? Number.parseInt( this.limitList[userID] ) : this.globalLimit;
	}
}

export default class Interval {
	private readonly unixTimeTemp: Record<number, number>;
	private readonly settingData: Record<IntervalType, IntervalSettingData>;
	private readonly redis: Database;
	
	constructor( config: BotConfig, redis: Database ) {
		this.unixTimeTemp = {};
		this.settingData = {
			group: {
				setting: new IntervalSetting( redis, "adachi.group-interval", config.groupIntervalTime ),
				prefix: "g"
			},
			private: {
				setting: new IntervalSetting( redis, "adachi.private-interval", config.privateIntervalTime ),
				prefix: "u"
			}
		}
		this.redis = redis;
	}
	
	public check( id: string | number, type: IntervalType ): boolean {
		const nowTime: number = new Date().getTime();
		const pId: string = this.settingData[type].prefix + id;
		const past: number = nowTime - ( this.unixTimeTemp[pId] || 0 );
		
		const limit: number = this.get( pId, type );
		if ( past <= limit ) {
			return false;
		} else {
			this.unixTimeTemp[pId] = nowTime;
			return true;
		}
	}
	
	public get( id: string | number, type: IntervalType ): number {
		const intervalSetting: IntervalSetting = this.settingData[type].setting;
		return intervalSetting.get( id );
	}
	
	public async set( id: number | string, type: IntervalType, time: number ): Promise<void> {
		const setting: IntervalSetting = this.settingData[type].setting;
		await this.redis.setHash( setting.dbKey, { [id]: time } );
		
		setting.limitList[id] = time.toString();
	}
}