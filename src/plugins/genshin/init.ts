import { Config } from "./types";
import { PluginSetting } from "@modules/plugin";
import { BOT } from "@modules/bot";
import pluginSetting from "./setting";
import * as m from "./module";
import { createBrowser } from "./utils/render";
import { createServer } from "./server";
import FileManagement from "@modules/file";

export let config: Config;
export const artClass = new m.ArtClass();
export const cookies = new m.Cookies();
export const typeData = new m.TypeData();
export const aliasClass = new m.AliasClass();
export const almanacClass = new m.AlmanacClass();
export const wishClass = new m.WishClass();
export const dailyClass = new m.DailyClass();
export const slipClass = new m.SlipClass();
export const privateClass = new m.PrivateClass();

function loadConfig( file: FileManagement ): Config {
	const defaultConfig: Config = {
		cardWeaponStyle: "normal",
		serverPort: 58612
	};
	
	function load(): Config {
		const config: any = file.loadYAML( "genshin" );

		/* 检查 defaultConfig 是否更新 */
		const keysNum = o => Object.keys( o ).length;
		if ( keysNum( config ) !== keysNum( defaultConfig ) ) {
			const c: any = {};
			const keys: string[] = Object.keys( defaultConfig );
			for ( let k of keys ) {
				c[k] = config[k] ? config[k] : defaultConfig[k];
			}
			file.writeYAML( "genshin", c );
			return c;
		}
		
		return config;
	}
	
	const path: string = file.getFilePath( "genshin.yml" );
	const isExist: boolean = file.isExist( path );
	if ( !isExist ) {
		file.createYAML( "genshin", defaultConfig );
		return defaultConfig;
	} else {
		return load();
	}
}

export async function init( { file, logger }: BOT ): Promise<PluginSetting> {
	config = loadConfig( file );
	createServer( config, logger );
	await createBrowser();
	
	return pluginSetting;
}