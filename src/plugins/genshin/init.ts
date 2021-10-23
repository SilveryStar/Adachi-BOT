import { addPlugin } from "../../modules/plugin";
import { createServer } from "./server";
import { createBrowser } from "./utils/render";
import { resolve } from "path";
import { exists, createYAML, loadYAML, writeYAML } from "../../utils/config";
import { Config } from "./types";
import { ROOTPATH } from "../../../app";
import commands from "./command";
import * as m from "./module";

let config: Config;
export const artClass = new m.ArtClass();
export const cookies = new m.Cookies();
export const typeData = new m.TypeData();
export const aliasClass = new m.AliasClass();
export const dailyClass = new m.DailyClass();
export const wishClass = new m.WishClass();
export const slipClass = new m.SlipClass();
export const privateClass = new m.PrivateClass();

function loadConfig(): Config {
	const defaultConfig: Config = {
		cardWeaponStyle: "normal",
		serverPort: 58612
	};
	
	function load(): Config {
		const config: any = loadYAML( "genshin" );
		
		/* 针对旧版 genshin.yml 配置进行修改 */
		if ( config["silvery-star.art"] !== undefined ) {
			const c: any = {};
			c.cardWeaponStyle = "normal";
			c.serverPort = config.serverPort;
			writeYAML( "genshin", c );
			return c;
		}
		
		/* 检查 defaultConfig 是否更新 */
		const keysNum = o => Object.keys( o ).length;
		if ( keysNum( config ) !== keysNum( defaultConfig ) ) {
			const c: any = {};
			const keys: string[] = Object.keys( defaultConfig );
			for ( let k of keys ) {
				c[k] = config[k] ? config[k] : defaultConfig[k];
			}
			writeYAML( "genshin", c );
			return c;
		}
		
		return config;
	}
	
	const isExist: boolean = exists( resolve( ROOTPATH, "config/genshin.yml" ) );
	if ( !isExist ) {
		createYAML( "genshin", defaultConfig );
		return defaultConfig;
	} else {
		return load();
	}
}

async function init(): Promise<any> {
	config = loadConfig();
	createServer();
	await createBrowser();
	
	return addPlugin( "genshin", ...commands );
}

export { init, config }