import pluginSetting from "./setting";
import { Renderer } from "@/modules/renderer";
import { BOT } from "@/main";
import { PluginSetting, PluginSubSetting, SubInfo } from "@/modules/plugin";
import * as m from "./module";
import { getRandomString } from "@/utils/common";

const initConfig = {
	cardWeaponStyle: "normal",
	cardProfile: "random",
	showCharScore: true,
	wishLimitNum: 99,
	verifyEnable: false,
	verifyRepeat: 1,
	verifyToken: getRandomString( 6 )
};

export let config: typeof initConfig;

export let renderer: Renderer;
export let artClass: m.ArtClass;
export let cookies: m.Cookies;
export let typeData: m.TypeData;
export let aliasClass: m.AliasClass;
export let almanacClass: m.AlmanacClass;
export let wishClass: m.WishClass;
export let dailyClass: m.DailyClass;
export let slipClass: m.SlipClass;
export let privateClass: m.PrivateClass;
export let characterID: m.CharacterId;

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

function initModules() {
	artClass = new m.ArtClass();
	cookies = new m.Cookies();
	typeData = new m.TypeData();
	aliasClass = new m.AliasClass();
	almanacClass = new m.AlmanacClass();
	wishClass = new m.WishClass();
	dailyClass = new m.DailyClass();
	slipClass = new m.SlipClass();
	privateClass = new m.PrivateClass();
	characterID = new m.CharacterId();
}

export async function subInfo(): Promise<PluginSubSetting> {
	return {
		subs: subs,
		reSub: decreaseFriend
	}
}

export async function init( { renderer: botRenderer, refresh, config: botConfig }: BOT ): Promise<PluginSetting> {
	/* 加载 genshin.yml 配置 */
	config = botConfig.register( "genshin", initConfig );
	/* 实例化渲染器 */
	renderer = botRenderer.register( "/genshin", "#app" );
	/* 初始化模块 */
	initModules();
	refresh.registerRefreshableFile( "cookies", cookies );
	
	return pluginSetting;
}