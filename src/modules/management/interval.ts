import { BotConfig } from "@/modules/config";
import Database from "@/modules/database";

export type IntervalType = "private" | "group";

export interface IntervalSettingData {
	setting: IntervalSetting,
	prefix: string
}

interface IntervalImplement {
	set( id: number | string, type: IntervalType, time: number ): Promise<void>
	get( id: number | string, type: IntervalType ): number
	check( id: number | string, type: IntervalType ): boolean;
}

class IntervalSetting {
	public dbKey: string;
	public globalLimit: number;
	public limitList: Record<string, string> = {};
	
	constructor( redis: Database, dbKey: string, limit: number ) {
		this.dbKey = dbKey;
		this.globalLimit = limit;
		/* 等待 redis 连接成功 */
		redis.waitConnected().then( () => {
			redis.getHash( this.dbKey ).then( res => {
				this.limitList = { ...res };
			} );
		} );
	}
	
	public get( userID: number | string ): number {
		return this.limitList[userID] ? Number.parseInt( this.limitList[userID] ) : this.globalLimit;
	}
}

export default class Interval implements IntervalImplement {
	private readonly unixTimeTemp: Record<number, number>;
	private readonly settingData: Record<IntervalType, IntervalSettingData>;
	
	constructor( config: BotConfig["directive"], private readonly redis: Database ) {
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
		config.on( "refresh", newCfg => {
			this.settingData.group.setting.globalLimit = newCfg.groupIntervalTime;
			this.settingData.private.setting.globalLimit = newCfg.privateIntervalTime;
		} );
	}
	
	public check( id: number | string, type: IntervalType ): boolean {
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
	
	public get( id: number | string, type: IntervalType ): number {
		const intervalSetting: IntervalSetting = this.settingData[type].setting;
		return intervalSetting.get( id );
	}
	
	public async set( id: number | string, type: IntervalType, time: number ): Promise<void> {
		const setting: IntervalSetting = this.settingData[type].setting;
		await this.redis.setHash( setting.dbKey, { [id]: time } );
		
		setting.limitList[id] = time.toString();
	}
}