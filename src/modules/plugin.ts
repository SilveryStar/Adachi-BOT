import * as cmd from "./command";
import { BasicConfig } from "./command";
import { BOT } from "@/main";
import { extname } from "path";
import { Router } from "express";
import axios, { AxiosError, AxiosResponse } from "axios";
import Progress from "@/utils/progress";
import { Renderer } from "@/modules/renderer";
import { compareAssembleObject, getObjectKeyValue } from "@/utils/object";
import { isIgnorePath } from "@/utils/path";
import { parse, stringify } from "yaml";
import { isJsonString } from "@/utils/verify";

export interface RenderRoutes {
	path: string;
	componentData: {
		plugin: string;
		renderDir: string;
		fileDir?: string;
		fileName: string;
	};
}

export interface ServerRouters {
	path: string;
	router: Router;
}

export interface PluginLoadResult {
	renderRoutes: Array<RenderRoutes>;
	serverRouters: Array<ServerRouters>;
	registerCmd: Array<BasicConfig>;
}

export type SubInfo = {
	name: string;
	users: number[];
};

export type PluginSubSetting = {
	subs: ( bot: BOT ) => Promise<SubInfo[]>;
	reSub: ( userId: number, bot: BOT ) => Promise<void>;
}

export type RenderRegister = ( defaultSelector: string ) => Renderer;

export type PluginParameter = {
	renderRegister: RenderRegister;
	configRegister: <T extends Record<string, any>>( initCfg: T, setValueCallBack?: ( config: T ) => T ) => T;
} & BOT;

export type PluginHook = ( input: PluginParameter ) => void | Promise<void>;

export interface PluginSetting {
	name: string;
	cfgList: cmd.ConfigType[];
	aliases?: string[];
	renderer?: boolean | {
		dirname?: string;
		mainFiles?: string[];
	};
	server?: {
		routers?: Record<string, Router>;
	};
	repo?: string | {
		owner: string;// 仓库拥有者名称
		repoName: string;// 仓库名称
		ref?: string;// 分支名称
	}; // 设置为非必须兼容低版本插件
	assets?: string | { // 是否从线上同步更新静态资源
		manifestUrl: string; // 线上 manifest.yml 文件地址
		overflowPrompt?: string; // 超出最大更新数量后给予的提示消息
		noOverride?: string[];  // 此配置项列举的拓展名文件，当位于用户配置的忽略文件中时，仍下载更新，但仅更新新增内容不对原内容进行覆盖
		replacePath?: ( path: string ) => string; // 修改下载后的文件路径
	};
	completed?: PluginHook; // 更新完毕后的回调函数
}

export const PluginReSubs: Record<string, PluginSubSetting> = {};

export const PluginRawConfigs: Record<string, Pick<PluginSetting, "name" | "cfgList">> = {};

export const PluginUpgradeServices: Record<string, string> = {};

export const PluginAlias: Record<string, string> = {};

// 不支持热更新的插件集合，这些插件不会被提示不支持热更新。
const not_support_upgrade_plugins: string[] = [ "@help", "@management", "genshin", "tools" ];

export default class Plugin {
	public static async load( bot: BOT ): Promise<PluginLoadResult> {
		globalThis.definePlugin = ( config ) => config;
		
		const commandConfig: Record<string, any> = bot.file.loadYAML( "commands" ) || {};
		const plugins: string[] = bot.file.getDirFiles( "", "plugin" );
		const renderRoutes: Array<RenderRoutes> = [];
		const serverRouters: Array<ServerRouters> = [];
		const registerCmd: BasicConfig[] = [];
		// 要写入的 command.yml 配置文件内容
		let cmdConfig = {};
		
		/* 从 plugins 文件夹从导入 init.ts 进行插件初始化 */
		for ( let plugin of plugins ) {
			try {
				const init = await import( `#/${ plugin }/init.ts` );
				const {
					name,
					renderer,
					server,
					cfgList,
					repo,
					aliases,
					assets,
					completed
				}: PluginSetting = init.default;
				// 检查更新插件静态资源
				await checkUpdate( plugin, name, assets, bot );
				// if ( subInfo ) {
				// 	const { reSub, subs }: PluginSubSetting = await subInfo( bot );
				// 	PluginReSubs[name] = { reSub, subs };
				// }
				// 加载前端渲染页面路由
				if ( renderer ) {
					const renderDir = getObjectKeyValue( renderer, "dirname", "views" );
					const mainFiles = getObjectKeyValue( renderer, "mainFiles", [ "index" ] );
					const views = bot.file.getDirFiles( `${ plugin }/${ renderDir }`, "plugin" );
					views.forEach( v => {
						const route = setRenderRoute( bot, plugin, renderDir, mainFiles, v );
						if ( route ) {
							renderRoutes.push( route );
						}
					} );
				}
				// 加载 express server 路由
				if ( server?.routers ) {
					Object.entries( server.routers ).forEach( ( [ path, router ] ) => {
						serverRouters.push( {
							path: `/${ plugin }${ path }`,
							router
						} )
					} )
				}
				//
				const [ commands, cmdConfigItem ] = await Plugin.parse( bot, cfgList, plugin, name, commandConfig );
				PluginRawConfigs[plugin] = { name, cfgList };
				if ( !not_support_upgrade_plugins.includes( name ) ) {
					PluginUpgradeServices[name] = repo ?
						typeof repo === "string" ?
							`https://api.github.com/repos/${ repo }/commits` :
							`https://api.github.com/repos/${ repo.owner }/${ repo.repoName }/commits${ repo.ref ? "/" + repo.ref : "" }`
						: ""
				}
				if ( aliases && aliases.length > 0 ) {
					for ( let alias of aliases ) {
						PluginAlias[alias] = name;
					}
				}
				registerCmd.push( ...commands );
				cmdConfig = { ...cmdConfig, ...cmdConfigItem };
				
				const configRegister = <T extends Record<string, any>>( initCfg: T, setValueCallBack: ( config: T ) => T = config => config ): T => {
					return bot.config.register( plugin, initCfg, setValueCallBack );
				}
				
				const renderRegister = ( defaultSelector: string ) => {
					return bot.renderer.register( `/${ plugin }`, defaultSelector );
				}
				
				// 生命周期：插件加载完成
				if ( completed ) {
					await completed( { ...bot, renderRegister, configRegister } );
				}
				
				bot.logger.info( `插件 ${ name } 加载完成` );
			} catch ( error ) {
				bot.logger.error( `插件 ${ plugin } 加载异常: ${ <string>error }` );
			}
		}
		
		bot.file.writeYAML( "commands", cmdConfig );
		return { renderRoutes, serverRouters, registerCmd };
	}
	
	public static async parse(
		bot: BOT,
		cfgList: cmd.ConfigType[],
		pluginPath: string,
		pluginName: string,
		configData: Record<string, any>
	): Promise<[ cmd.BasicConfig[], Record<string, any> ]> {
		const commands: cmd.BasicConfig[] = [];
		const configList: Record<string, any> = {};
		
		/* 此处删除所有向后兼容代码 */
		for ( const config of cfgList ) {
			{
				/* 允许 main 传入函数 */
				if ( typeof config.main === "string" ) {
					const main: string = config.main || "index";
					const { main: entry } = await import(`#/${ pluginPath }/${ main }`);
					config.run = entry;
				} else {
					config.run = config.main;
				}
				
				const key: string = config.cmdKey;
				const loaded = configData[key];
				
				/* 读取 commands.yml 配置，创建指令实例  */
				try {
					let command: cmd.BasicConfig;
					switch ( config.type ) {
						case "order":
							if ( loaded ) cmd.Order.read( config, loaded );
							command = new cmd.Order( config, bot.config, pluginName );
							break;
						case "switch":
							if ( loaded ) cmd.Switch.read( config, loaded );
							command = new cmd.Switch( config, bot.config, pluginName );
							break;
						case "enquire":
							if ( loaded ) cmd.Enquire.read( config, loaded );
							command = new cmd.Enquire( config, bot.config, pluginName );
							break;
					}
					if ( !loaded || loaded.enable ) {
						commands.push( command );
					}
					configList[key] = command.write();
				} catch ( error ) {
					bot.logger.error( <string>error );
				}
			}
		}
		return [ commands, configList ];
	}
}

interface IOssListObject {
	name: string;
	url: string;
	lastModified: string;
	etag: string;
	type: string;
	size: number;
	storageClass: string;
	owner: null;
}

// to do: 未实现删除被移除的文件
// 1、获取本地清单文件内容 manifestData
// 2、传递本地清单文件调用接口，接口：获取线上清单目录文件，diff算法对比两个清单文件差异性，返回差异性部分
// 3、依次下载清单文件列表文件，每下载完成一个时更新 manifestData 内容
// 4、下载完毕后以 manifestData 内容更新本地清单文件
async function checkUpdate( plugin: string, pluginName: string, assets: PluginSetting["assets"], bot: BOT ): Promise<void> {
	if ( !assets ) return;
	const commonUrl = `assets/${ plugin }`;
	const baseUrl = `public/${ commonUrl }`;
	const manifestName = `${ baseUrl }/manifest`;
	// 该清单列表中的文件内容不会进行覆盖，仅做更新处理
	const ignoreName = `${ baseUrl }/.adachiignore`;
	
	const { path: ignorePath } = bot.file.createFile( ignoreName, "", "root" );
	
	const manifest = <IOssListObject[]>( bot.file.loadYAML( manifestName, "root" ) || [] );
	let res: AxiosResponse<{
		code: number;
		data: IOssListObject[];
		msg: string;
	}>;
	
	let data: IOssListObject[];
	
	try {
		res = await axios.post( "https://api-kozakura.marrydream.top/common/adachi/v1/oss/update/files", {
			url: typeof assets === "string" ? assets : assets.manifestUrl,
			list: manifest
		} );
		data = res.data.data;
	} catch ( error: any ) {
		if ( ( <AxiosError>error ).response?.status === 415 ) {
			throw getObjectKeyValue( assets, "overflowPrompt", "更新文件数量超过阈值，请手动更新资源包" );
		} else {
			data = [];
			bot.logger.error( `检查更新失败，远程服务器异常：${ <string>error }` )
		}
	}
	// 不存在更新项，返回
	if ( !data.length ) {
		bot.logger.info( `未检测到 ${ pluginName } 可更新静态资源` );
		return;
	}
	
	const progress = new Progress( `下载 ${ pluginName } 静态资源`, data.length );
	
	let downloadNum: number = 0, errorNum: number = 0;
	// 更新图片promise列表
	const updatePromiseList: Promise<void>[] = [];
	
	data.forEach( file => {
		const replacePath = getObjectKeyValue( assets, "replacePath", null );
		const filePath = replacePath ? replacePath( file.name ) : file.name;
		
		// 是否为清单排除文件
		const isIgnore = isIgnorePath( ignorePath, bot.file.getFilePath( `${ baseUrl }/${ filePath }`, "root" ) );
		const noOverrideList = getObjectKeyValue( assets, "noOverride", [ "yml", "json" ] )
		
		const fileExt = extname( file.url ).slice( 1 );
		// 位于排除文件中，不进行更新
		if ( isIgnore && !noOverrideList.includes( fileExt ) ) {
			return;
		}
		updatePromiseList.push( ( async () => {
			try {
				const pathList = [ `${ baseUrl }/${ filePath }` ];
				
				if ( process.env.NODE_ENV === "production" ) {
					pathList.push( `dist/${ commonUrl }/${ filePath }` );
				}
				await bot.file.downloadFile( file.url, pathList, data => {
					// 不再忽略清单文件中时直接返回原数据
					if ( !isIgnore ) {
						return data;
					}
					// 对仅更新新内容不覆盖原内容的文件数据进行处理
					const onlineData: string = data.toString();
					const oldFileData = bot.file.loadFile( pathList[0], "root" );
					let oldValue: any, newValue: any;
					if ( fileExt === "yml" ) {
						oldValue = parse( oldFileData );
						// 此时文件内容无法比对，直接返回原内容不进行覆盖
						if ( typeof oldValue === "string" ) {
							return oldFileData;
						}
						newValue = parse( onlineData );
					} else {
						// 此时文件内容无法比对，直接返回原内容不进行覆盖
						if ( !isJsonString( oldFileData ) || !isJsonString( onlineData ) ) {
							return oldFileData;
						}
						oldValue = JSON.parse( oldFileData );
						newValue = JSON.parse( onlineData );
					}
					const newFileData = compareAssembleObject( oldValue, newValue, false );
					return fileExt === "yml" ? stringify( newFileData ) : JSON.stringify( newFileData );
				} );
				
				// 下载成功后新增清单项
				// 若清单项已存在则先删除再添加
				const key = manifest.findIndex( item => item.name === file.name );
				if ( key !== -1 ) {
					manifest.splice( key, 1, file );
				} else {
					manifest.push( file );
				}
			} catch ( error ) {
				errorNum++;
			}
			downloadNum++;
			progress.renderer( downloadNum, `下载失败：${ errorNum }`, bot.config.webConsole.enable );
		} )() );
	} );
	
	// 不存在更新项，返回
	if ( !updatePromiseList.length ) {
		bot.logger.info( `未检测到 ${ pluginName } 可更新静态资源` );
		return;
	}
	
	// 重新设置进度条长度
	progress.setTotal( updatePromiseList.length );
	
	// 遍历下载资源文件
	await Promise.all( updatePromiseList );
	
	// 写入清单文件
	bot.file.writeYAML( manifestName, manifest, "root" );
}

/* 获取插件渲染页的路由对象 */
function setRenderRoute( bot: BOT, plugin: string, renderDir: string, mainFiles: string[], view: string ): RenderRoutes | null {
	let route: RenderRoutes | null = null;
	const ext: string = extname( view );
	if ( ext === ".vue" ) {
		// 加载后缀名为 vue 的文件
		const fileName: string = view.replace( /\.vue$/, "" );
		route = {
			path: `/${ plugin }/${ fileName }`,
			componentData: {
				plugin,
				renderDir,
				fileName
			}
		}
	} else if ( !ext ) {
		// 后缀名不存在且为目录时，加载目录下的 index.vue 文件
		const fileType = bot.file.getFileType( `${ plugin }/${ renderDir }/${ view }`, "plugin" );
		if ( fileType === "directory" ) {
			for ( const mainFile of mainFiles ) {
				const path: string = bot.file.getFilePath( `${ plugin }/${ renderDir }/${ view }/${ mainFile }.vue`, "plugin" );
				// 判断目录下是否存在 mainFile
				const isExist: boolean = bot.file.isExist( path );
				if ( isExist ) {
					route = {
						path: `/${ plugin }/${ view }`,
						componentData: {
							plugin,
							renderDir,
							fileDir: view,
							fileName: mainFile
						}
					};
					break;
				}
			}
		}
	}
	
	return route;
}

type name<T extends Record<string, any> = any> = {
	foo( v: T ): T;
}

const a: name = {
	foo( v: { a: 1 } ) {
		return v;
	}
}