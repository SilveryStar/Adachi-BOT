import { scheduleJob } from "node-schedule";
import { getWeaponList } from "#/genshin/utils/meta";
import { WeaponList } from "#/genshin/module/type";

export class WeaponMap {
	public map = this.getList();
	
	constructor() {
		scheduleJob( "0 0 0 * * *", async () => {
			this.map = this.getList();
		} );
	}
	
	private getList(): WeaponList {
		const data = getWeaponList();
		return {
			...data,
			...Object.fromEntries( Object.values( data ).map( info => {
				return [ info.name, info ];
			} ) )
		}
	}
}