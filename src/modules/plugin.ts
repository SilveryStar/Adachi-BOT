import * as cmd from "./command";
import { BasicConfig } from "./command";
import { BOT } from "@/main";
import { getConfigValue } from "@/utils/common";
import { extname } from "path";
import { RenderRoutes, ServerRouters } from "@/types/render";
import { Router } from "express";

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

export interface PluginSetting {
	pluginName: string;
	cfgList: cmd.ConfigType[];
	aliases?: string[];
	render?: boolean | {
		dirname?: string;
		mainFiles?: string[];
	};
	server?: {
		routers?: Record<string, Router>
	};
	repo?: string | {
		owner: string;// 仓库拥有者名称
		repoName: string;// 仓库名称
		ref?: string;// 分支名称
	}; // 设置为非必须兼容低版本插件
}

export const PluginReSubs: Record<string, PluginSubSetting> = {};

export const PluginRawConfigs: Record<string, cmd.ConfigType[]> = {};

export const PluginUpgradeServices: Record<string, string> = {};

export const PluginAlias: Record<string, string> = {};

// 不支持热更新的插件集合，这些插件不会被提示不支持热更新。
const not_support_upgrade_plugins: string[] = [ "@help", "@management", "genshin", "tools" ];

export default class Plugin {
	public static async load( bot: BOT ): Promise<PluginLoadResult> {
		const plugins: string[] = bot.file.getDirFiles( "", "plugin" );
		const renderRoutes: Array<RenderRoutes> = [];
		const serverRouters: Array<ServerRouters> = [];
		const registerCmd: BasicConfig[] = [];
		
		/* 从 plugins 文件夹从导入 init.ts 进行插件初始化 */
		for ( let plugin of plugins ) {
			try {
				const { init, subInfo } = await import( `#/${ plugin }/init.ts` );
				const { pluginName, render, server, cfgList, repo, aliases }: PluginSetting = await init( bot );
				if ( subInfo ) {
					const { reSub, subs }: PluginSubSetting = await subInfo( bot );
					PluginReSubs[pluginName] = { reSub, subs };
				}
				// 加载前端渲染页面路由
				if ( render ) {
					const renderDir = getConfigValue( render, "dirname", "views" );
					const mainFiles = getConfigValue( render, "mainFiles", [ "index" ] );
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
				const commands = Plugin.parse( bot, cfgList, pluginName );
				PluginRawConfigs[pluginName] = cfgList;
				if ( !not_support_upgrade_plugins.includes( pluginName ) ) {
					PluginUpgradeServices[pluginName] = repo ?
						typeof repo === "string" ?
							`https://api.github.com/repos/${ repo }/commits` :
							`https://api.github.com/repos/${ repo.owner }/${ repo.repoName }/commits${ repo.ref ? "/" + repo.ref : "" }`
						: ""
				}
				if ( aliases && aliases.length > 0 ) {
					for ( let alias of aliases ) {
						PluginAlias[alias] = pluginName;
					}
				}
				registerCmd.push( ...commands );
				bot.logger.info( `插件 ${ pluginName } 加载完成` );
			} catch ( error ) {
				bot.logger.error( `插件 ${ plugin } 加载异常: ${ <string>error }` );
			}
		}
		return { renderRoutes, serverRouters, registerCmd };
	}
	
	public static parse(
		bot: BOT,
		cfgList: cmd.ConfigType[],
		pluginName: string
	): cmd.BasicConfig[] {
		const commands: cmd.BasicConfig[] = [];
		const data: Record<string, any> = bot.file.loadYAML( "commands" );
		
		/* 此处删除所有向后兼容代码 */
		cfgList.forEach( config => {
			/* 允许 main 传入函数 */
			if ( config.main instanceof Function ) {
				config.run = config.main;
			} else {
				const main: string = config.main || "index";
				const path: string = bot.file.getFilePath(
					pluginName + "/" + main,
					"plugin"
				);
				config.run = require( path ).main;
			}
			
			const key: string = config.cmdKey;
			const loaded = data[key];
			if ( loaded && !loaded.enable ) {
				return;
			}
			
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
				data[key] = command.write();
				commands.push( command );
			} catch ( error ) {
				bot.logger.error( <string>error );
			}
		} );
		
		bot.file.writeYAML( "commands", data );
		return commands;
	}
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