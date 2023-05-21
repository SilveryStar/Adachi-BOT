import { scheduleJob } from "node-schedule";
import { getCharacterList } from "#/genshin/utils/meta";
import { CharacterList } from "#/genshin/module/type";

export class CharacterMap {
	public map = this.getList();
	
	constructor() {
		scheduleJob( "0 0 0 * * *", async () => {
			this.map = this.getList();
		} );
	}
	
	private getList(): CharacterList {
		const data = getCharacterList();
		return {
			...data,
			...Object.fromEntries( Object.values( data ).map( info => {
				return [ info.name, info ];
			} ) )
		}
	}
}