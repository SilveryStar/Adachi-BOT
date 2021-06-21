import { getWishConfig } from "../utils/api";
import { scheduleJob } from "node-schedule";

class TypeData {
	public weapon: any;
	public character: any;
	
	constructor() {
		getWishConfig( "character" ).then( ( result: any ) => {
			this.character = result;
		} );
		getWishConfig( "weapon" ).then( ( result: any ) => {
			this.weapon = result;
		} );
		scheduleJob( "0 0 0 * * *", async () => {
			this.weapon = await getWishConfig( "weapon" );
			this.character = await getWishConfig( "character" );
		} );
	}
}

export { TypeData }