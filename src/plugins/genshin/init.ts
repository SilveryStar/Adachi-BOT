import bot from "ROOT";
import * as m from "./module";
import GenshinConfig from "#genshin/module/config";
import pluginSetting from "./setting";
import FileManagement from "@modules/file";
import Renderer from "@modules/renderer";
import { BOT } from "@modules/bot";
import { PluginSetting } from "@modules/plugin";
import { createServer } from "./server";

export let config: GenshinConfig;
export let renderer: Renderer;
export const artClass = new m.ArtClass();
export const cookies = new m.Cookies();
export const typeData = new m.TypeData();
export const aliasClass = new m.AliasClass();
export const almanacClass = new m.AlmanacClass();
export const wishClass = new m.WishClass();
export const dailyClass = new m.DailyClass();
export const slipClass = new m.SlipClass();
export const privateClass = new m.PrivateClass();
export const characterID = new m.CharacterId();

function loadConfig( file: FileManagement ): GenshinConfig {
	const initCfg = GenshinConfig.init;
	
	const path: string = file.getFilePath( "genshin.yml" );
	const isExist: boolean = file.isExist( path );
	if ( !isExist ) {
		file.createYAML( "genshin", initCfg );
		return new GenshinConfig( initCfg );
	}
	
	const config: any = file.loadYAML( "genshin" );
	const keysNum = o => Object.keys( o ).length;
	
	/* 检查 defaultConfig 是否更新 */
	if ( keysNum( config ) !== keysNum( initCfg ) ) {
		const c: any = {};
		const keys: string[] = Object.keys( initCfg );
		for ( let k of keys ) {
			c[k] = config[k] ? config[k] : initCfg[k];
		}
		file.writeYAML( "genshin", c );
		return c;
	}
	return config;
}

export async function init( { file, logger }: BOT ): Promise<PluginSetting> {
	/* 加载 genshin.yml 配置 */
	config = loadConfig( file );
	/* 实例化渲染器 */
	renderer = new Renderer(
		"genshin", "/views",
		config.serverPort, "#app"
	);
	/* 启动 express 服务 */
	createServer( config, logger );
	
	bot.refresh.registerRefreshableFile( "genshin", config );
	bot.refresh.registerRefreshableFile( "cookies", cookies );
	bot.refresh.registerRefreshableFunc( renderer );
	
	return pluginSetting;
}