import { getArtifact, getWishConfig } from "../utils/api";
import { scheduleJob } from "node-schedule";

export class TypeData {
	public weapon: any;
	public character: any;
	public artifact: any;
	
	constructor() {
		getArtifact().then( result => this.artifact = result );
		getWishConfig( "character" ).then( result => this.character = result );
		getWishConfig( "weapon" ).then( result => this.weapon = result );
		
		scheduleJob( "0 0 0 * * *", async () => {
			this.weapon = await getWishConfig( "weapon" );
			this.character = await getWishConfig( "character" );
			this.artifact = await getArtifact();
		} );
	}
	
	public getNameList(): string[] {
		return [
			...Object.keys( this.weapon ),
			...Object.keys( this.character ),
			...this.artifact.suitNames
		];
	}
}