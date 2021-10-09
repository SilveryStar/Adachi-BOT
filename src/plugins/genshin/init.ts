import { addPlugin } from "../../modules/plugin";
import { createServer } from "./server";
import { createYAML, loadYAML, writeYAML } from "../../utils/config";
import { getArtifact, getSlip } from "./utils/api";
import { createBrowser } from "./utils/render";
import { CommandType } from "../../modules/command";
import { Cookies } from "./module/cookies";
import { TypeData } from "./module/type";
import { ArtClass } from "./module/artifact";
import { WishClass } from "./module/wish";
import { SlipClass } from "./module/slip";
import { AliasClass } from "./module/alias";
import { DailyClass } from "./module/daily";
import defaultCommandList from "./command";

let cookies: Cookies;
let artClass: ArtClass;
let wishClass: WishClass;
let slipClass: SlipClass;
let aliasClass: AliasClass;
let dailyClass: DailyClass;
let typeData: TypeData;
let config: any;

function getKeys(): any {
	let res: any = {};
	for ( let c of defaultCommandList ) {
		res[c.key] = true;
	}
	return res;
}

function elementNum( o: object ) {
	return Object.getOwnPropertyNames( o ).length;
}

function loadConfig(): any {
	const load: any = loadYAML( "genshin" );
	if ( elementNum( load ) - 1 !== defaultCommandList.length ) {
		const newConfig: any = {
			...getKeys(),
			serverPort: 58612
		}
		writeYAML( "genshin", newConfig );
		
		return newConfig;
	}
	return load;
}

function initCommandList( config: any ): CommandType[] {
	let commandList: CommandType[] = [];
	
	for ( let key in config ) {
		if ( config.hasOwnProperty( key ) && config[key] === true ) {
			const comm: any = defaultCommandList.find( el => el.key === key );
			commandList.push( comm );
		}
	}
	
	return commandList;
}

async function init(): Promise<any> {
	createYAML( "genshin", {
		...getKeys(),
		serverPort: 58612
	} );
	
	config = loadConfig();
	artClass = new ArtClass( await getArtifact() );
	cookies = new Cookies();
	wishClass = new WishClass();
	slipClass = new SlipClass( await getSlip() );
	dailyClass = new DailyClass();
	typeData = new TypeData();
	aliasClass = new AliasClass();
	createServer();
	await createBrowser();
	
	return addPlugin( "genshin", ...initCommandList( config ) );
}

export {
	init,
	cookies,
	config,
	artClass,
	wishClass,
	slipClass,
	aliasClass,
	dailyClass,
	typeData
}