import { scheduleJob } from "node-schedule";
import { getCharacterID } from "#genshin/utils/api";

export class CharacterId {
	public map: Record<string, number> = {};
	
	constructor() {
		getCharacterID().then( res => this.map = res );
		scheduleJob( "0 0 0 * * *", async () => {
			this.map = await getCharacterID();
		} );
	}
}