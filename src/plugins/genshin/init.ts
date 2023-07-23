import cfgList from "./commands";
import { Renderer } from "@/modules/renderer";
import { definePlugin } from "@/modules/plugin";
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

function initModules( cookie: string[] ) {
	characterMap = new m.CharacterMap();
	weaponMap = new m.WeaponMap();
	artClass = new m.ArtClass();
	cookies = new m.Cookies( cookie );
	typeData = new m.TypeData();
	aliasClass = new m.AliasClass();
	almanacClass = new m.AlmanacClass();
	wishClass = new m.WishClass();
	dailyClass = new m.DailyClass();
	slipClass = new m.SlipClass();
	privateClass = new m.PrivateClass();
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
		downloadBaseUrl: "https://mari-plugin.oss-cn-beijing.aliyuncs.com",
		pathField: "name",
		modifiedField: "lastModified",
		overflowPrompt: "更新文件数量超过阈值，请手动前往 https://github.com/SilveryStar/Adachi-BOT/release 更新资源包",
		replacePath: path => {
			return path.replace( "Version3/genshin/", "" );
		}
	},
	subscribe: [
		{
			name: "私人服务",
			getUser() {
				return {
					person: privateClass.getUserIDList()
				}
			},
			async reSub( userId, type ) {
				if ( type === "private" ) {
					await privateClass.delBatchPrivate( userId );
				}
			}
		}, {
			name: "素材订阅",
			async getUser( { redis } ) {
				const dailyUserIds: string[] = await redis.getKeysByPrefix( "silvery-star.daily-sub-" );
				const dailyGroupIds: string[] = await redis.getList( "silvery-star.daily-sub-group" );
				return {
					person: dailyUserIds
						.map( el => parseInt( <string>el.split( "-" ).pop() ) )
						.filter( el => !!el ),
					group: dailyGroupIds.map( id => Number.parseInt( id ) )
				}
			},
			async reSub( userId, type, { redis } ) {
				if ( type === "private" ) {
					await redis.deleteKey( `silvery-star.daily-sub-${ userId }` );
				} else {
					const dbKey: string = "silvery-star.daily-sub-group";
					redis.delListElement( dbKey, userId.toString() );
				}
			}
		}
	],
	/* 初始化模块 */
	mounted( param ) {
		/* 加载 genshin.yml 配置 */
		config = param.configRegister( "main", initConfig );
		const cookieCfg = param.configRegister( "cookies", {
			cookies: [ "米游社Cookies(允许设置多个)" ]
		} );
		cookieCfg.on( "refresh", config => {
			cookies = new m.Cookies( config.cookies );
		} );
		/* 实例化渲染器 */
		renderer = param.renderRegister( "#app" );
		initModules( cookieCfg.cookies );
	}
} );