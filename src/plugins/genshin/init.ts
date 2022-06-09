import bot from "ROOT";
import * as m from "./module";
import GenshinConfig from "#genshin/module/config";
import pluginSetting from "./setting";
import FileManagement from "@modules/file";
import { Renderer } from "@modules/renderer";
import { BOT } from "@modules/bot";
import { PluginSetting, SubInfo } from "@modules/plugin";
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
		return new GenshinConfig( c );
	}
	return new GenshinConfig( config );
}

/* 删除好友后清除订阅服务 */
async function decreaseFriend( userId: number, { redis }: BOT ) {
	await privateClass.delBatchPrivate( userId );
	await redis.deleteKey( `silvery-star.daily-sub-${ userId }` );
}

export async function subs( { redis }: BOT ): Promise<SubInfo[]> {
	const dailySub: string[] = await redis.getKeysByPrefix( "silvery-star.daily-sub-" );
	const dailySubUsers: number[] = dailySub.map( el => {
		return parseInt( <string>el.split( "-" ).pop() );
	} );
	
	return [ {
		name: "私人服务",
		users: privateClass.getUserIDList()
	}, {
		name: "素材订阅",
		users: dailySubUsers
	} ]
}

export async function init( { file, logger }: BOT ): Promise<PluginSetting> {
	/* 加载 genshin.yml 配置 */
	config = loadConfig( file );
	/* 实例化渲染器 */
	renderer = bot.renderer.register(
		"genshin", "/views",
		config.serverPort, "#app"
	);
	/* 启动 express 服务 */
	createServer( config, logger );
	
	bot.refresh.registerRefreshableFile( "genshin", config );
	bot.refresh.registerRefreshableFile( "cookies", cookies );
	
	return {
		...pluginSetting,
		reSub: decreaseFriend
	};
}