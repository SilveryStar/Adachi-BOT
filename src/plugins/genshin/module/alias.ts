import { scheduleJob } from "node-schedule";
import { getAliasName } from "../utils/api";
import { Redis } from "../../../bot";

interface AliasMap {
	realName: string;
	aliasNames: string[];
}

export class AliasClass {
	public list: Map<string, string>;
	
	constructor() {
		this.list = new Map();
		async function parseData(): Promise<Map<string, string>> {
			const list = new Map();
			const set: Array<AliasMap> = await getAliasName();
			for ( let el of set ) {
				for ( let alias of el.aliasNames ) {
					list.set( alias, el.realName );
				}
			}
			
			const added: string[] = await Redis.getKeysByPrefix( "silvery-star.alias-add-" );
			for ( let key of added ) {
				const realName = key.split( "-" ).pop() as string;
				const aliasList: string[] = await Redis.getList( key );
				for ( let alias of aliasList ) {
					list.set( alias, realName );
				}
			}
			
			const removed: string[] = await Redis.getList( "silvery-star.alias-remove" );
			for ( let key of removed ) {
				const aliasList: string[] = await Redis.getList( key );
				for ( let alias of aliasList ) {
					list.delete( alias );
				}
			}
			
			return list;
		}
		
		parseData().then( ( result: Map<string, string> ) => {
			this.list = result;
		} );
		scheduleJob( "0 0 0 * * *", async () => {
			this.list = await parseData();
		} );
	}
	
	public addPair( alias: string, realName: string ): void {
		this.list.set( alias, realName );
	}
	
	public removeAlias( alias: string ): void {
		this.list.delete( alias );
	}
	
	public search( name: string ): string | undefined {
		return this.list.get( name );
	}
}