import bot from "ROOT";
import { getAliasName } from "../utils/api";
import { scheduleJob } from "node-schedule";

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
			const alias: Record<string, AliasMap[]> = await getAliasName();
			for ( let el of Object.values(alias).flat() ) {
				for ( let alias of el.aliasNames ) {
					list.set( alias, el.realName );
				}
			}
			
			const added: string[] = await bot.redis.getKeysByPrefix( "silvery-star.alias-add-" );
			for ( let key of added ) {
				const realName = <string>key.split( "-" ).pop();
				const aliasList: string[] = await bot.redis.getList( key );
				for ( let alias of aliasList ) {
					list.set( alias, realName );
				}
			}
			
			const removed: string[] = await bot.redis.getList( "silvery-star.alias-remove" );
			for ( let key of removed ) {
				const aliasList: string[] = await bot.redis.getList( key );
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