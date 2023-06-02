import cfgList from "./commands";
import { Renderer } from "@/modules/renderer";
import { BOT } from "@/main";
import { PluginSubSetting, SubInfo } from "@/modules/plugin";
import * as m from "./module";
import routers from "#/genshin/routes";
import { getRandomString } from "@/utils/random";

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
export let characterMap: m.CharacterMap;
export let weaponMap: m.WeaponMap;
export let artClass: m.ArtClass;
export let cookies: m.Cookies;
export let typeData: m.TypeData;
export let aliasClass: m.AliasClass;
export let almanacClass: m.AlmanacClass;
export let wishClass: m.WishClass;
export let dailyClass: m.DailyClass;
export let slipClass: m.SlipClass;
export let privateClass: m.PrivateClass;

function initModules() {
	characterMap = new m.CharacterMap();
	weaponMap = new m.WeaponMap();
	artClass = new m.ArtClass();
	cookies = new m.Cookies();
	typeData = new m.TypeData();
	aliasClass = new m.AliasClass();
	almanacClass = new m.AlmanacClass();
	wishClass = new m.WishClass();
	dailyClass = new m.DailyClass();
	slipClass = new m.SlipClass();
	privateClass = new m.PrivateClass();
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

export async function subInfo(): Promise<PluginSubSetting> {
	return {
		subs: subs,
		reSub: decreaseFriend
	}
}

export default definePlugin( {
	name: "原神",
	cfgList,
	renderer: {
		mainFiles: [ "index", "app" ]
	},
	server: {
		routers
	},
	assets: {
		manifestUrl: "https://mari-plugin.oss-cn-beijing.aliyuncs.com/Version3/genshin_assets_manifest.yml",
		overflowPrompt: "更新文件数量超过阈值，请手动前往 https://github.com/SilveryStar/Adachi-BOT/release 更新资源包",
		replacePath: path => {
			return path.replace( "Version3/genshin/", "" );
		}
	},
	/* 初始化模块 */
	completed( param ) {
		/* 加载 genshin.yml 配置 */
		config = param.configRegister( initConfig );
		/* 实例化渲染器 */
		renderer = param.renderRegister( "#app" );
		initModules();
		param.refresh.register( "cookies", cookies );
		param.refresh.register( initModules );
	}
} );