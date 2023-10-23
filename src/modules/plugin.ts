import * as cmd from "./command";
import { BasicConfig, InitType } from "./command";
import { BOT } from "@/modules/bot";
import { join } from "path";
import { Router } from "express";
import { Renderer } from "@/modules/renderer";
import { removeKeysStartsWith } from "@/utils/object";
import { ExportConfig } from "@/modules/config";
import { PresetPlace } from "@/modules/file";
import Refreshable, { RefreshTarget } from "@/modules/management/refresh";
import AssetsUpdate, { PluginAssetsSetting } from "@/modules/management/assets";
import RenderServer from "@/modules/server";

export interface ServerRouters {
	path: string;
	router: Router;
}

interface RefreshRegister {
	( fileName: string, target: RefreshTarget<"file">, place?: PresetPlace ): void;
	( target: RefreshTarget<"file"> ): void;
	( target: RefreshTarget<"fun"> ): void;
}

export type PluginParameter = {
	setAlias: ( aliases: string[] ) => void;
	refreshRegister: RefreshRegister;
	renderRegister: ( defaultSelector: string, baseUrl?: string ) => Renderer;
	configRegister: <T extends Record<string, any>>(
		fileName: string,
		initCfg: T,
		setValueCallBack?: ( config: T ) => T
	) => ExportConfig<T>;
} & BOT;

export interface PluginInfo {
	key: string;
	name: string;
	upgrade?: string;
	assets?: PluginAssetsSetting,
	publicDirs?: string[],
	aliases: string[];
	commands: BasicConfig[];
	cmdConfigs: cmd.ConfigType[];
	servers: ServerRouters[];
	subscribe: PluginSetting["subscribe"];
	sortIndex: number;
}

export type PluginHook = ( input: PluginParameter ) => void | Promise<void>;

type SubUser = {
	person?: number[];
	group?: number[];
};

export interface PluginSetting {
	name: string;
	cfgList: cmd.ConfigType[];
	server?: {
		routers?: Record<string, Router>;
	};
	/** 设置为非必须兼容低版本插件 */
	repo?: string | {
		/** 仓库拥有者名称 */
		owner: string;
		/** 仓库名称 */
		repoName: string;
		/** 分支名称 */
		ref?: string;
	};
	/** 是否从线上同步更新静态资源 */
	assets?: PluginAssetsSetting;
	/** 插件静态资源目录 */
	publicDirs?: string[],
	subscribe?: {
		name: string;
		getUser: ( bot: BOT ) => Promise<SubUser> | SubUser;
		reSub: ( userId: number, type: "private" | "group", bot: BOT ) => Promise<void> | void;
	}[];
	/** 钩子函数：插件加载完毕时触发 */
	mounted?: PluginHook;
	/** 钩子函数：插件卸载/重载时触发 */
	unmounted?: PluginHook;
}

export const definePlugin = <T extends PluginSetting>( config: T ) => config;

export default class Plugin {
	private static _instance: Plugin | null = null;
	public pluginList: Record<string, PluginInfo> = {};

	private pluginSettings: Record<string, PluginSetting> = {};
	
	constructor( private readonly bot: BOT ) {
	}
	
	public static getInstance( bot?: BOT ): Plugin {
		if ( !Plugin._instance ) {
			if ( !bot ) {
				throw new Error( "获取 plugin 实例出错" );
			}
			Plugin._instance = new Plugin( bot );
		}
		return Plugin._instance;
	}
	
	public async load( immediate = true ): Promise<Record<string, PluginSetting>> {
		const plugins: string[] = await this.bot.file.getDirFiles( "", "plugin" );
		
		let sortIndex = 0;
		/* 从 plugins 文件夹从导入 init.ts 进行插件初始化 */
		for ( let pluginKey of plugins ) {
			await this.loadSingle( pluginKey, immediate, false, sortIndex );
			sortIndex ++;
		}
		await this.bot.command.reload();
		return this.pluginSettings;
	}
	
	/**
	 * 加载单个插件
	 * @param pluginKey 插件目录名
	 * @param immediate 是否为立即执行插件 mounted 方法
	 * @param reloadCmd 是否为执行加载 command 方法
	 * @param sortIndex 排序
	 */
	public async loadSingle( pluginKey: string, immediate = true, reloadCmd = true, sortIndex = 0 ) {
		try {
			// 清楚指定插件的文件缓存
			removeKeysStartsWith( require.cache, this.bot.file.getFilePath( pluginKey, "plugin" ) );
			
			const init = await import( `#/${ pluginKey }/init.ts` );
			const {
				name: pluginName,
				server,
				cfgList,
				publicDirs,
				repo,
				assets,
				subscribe
			}: PluginSetting = init.default;
			
			if ( assets ) {
				await AssetsUpdate.getInstance().registerCheckUpdateJob( pluginKey, undefined, pluginName, assets );
			}

			const plugin: PluginInfo = {
				key: pluginKey,
				name: pluginName,
				assets: assets,
				aliases: [],
				publicDirs,
				commands: [],
				cmdConfigs: cfgList,
				servers: [],
				subscribe,
				sortIndex
			}
			
			// 加载 express server 路由
			if ( server?.routers ) {
				Object.entries( server.routers ).forEach( ( [ path, router ] ) => {
					plugin.servers.push( {
						path: `/${ pluginKey }${ path }`,
						router
					} )
				} )
			}
			
			if ( repo ) {
				const serverUrl = typeof repo === "string"
					? `${ repo }/commits`
					: `${ repo.owner }/${ repo.repoName }/commits${ repo.ref ? "/" + repo.ref : "" }`;
				
				plugin.upgrade = "https://api.github.com/repos/" + serverUrl;
			}
			
			this.bot.logger.info( `插件 ${ pluginName } 加载完成` );
			
			this.pluginList[pluginKey] = plugin;
			this.pluginSettings[pluginKey] = init.default;
			
			if ( reloadCmd ) {
				await this.bot.command.reload();
			}
			
			if ( immediate ) {
				await this.doMount( pluginKey );
			}
		} catch ( error ) {
			this.bot.logger.error( `插件 ${ pluginKey } 加载异常: ${ <string>error }` );
		}
	}
	
	/**
	 * 重载单个插件
	 * @param pluginKey 插件目录名
	 * @param immediate 是否为立即执行插件 mounted 方法
	 * @param reloadCmd 是否为执行加载 command 方法
	 */
	public async reloadSingle( pluginKey: string, immediate = true, reloadCmd = true ) {
		try {
			const oldSetting = this.pluginSettings[pluginKey];
			await this.doUnMount( pluginKey );
			
			/* 卸载插件刷新事件 */
			const refresh = Refreshable.getInstance();
			refresh.logout( pluginKey );
			
			/* 关闭静态资源更新任务 */
			const assetsUpdate = AssetsUpdate.getInstance();
			assetsUpdate.deregisterCheckUpdateJob( pluginKey );
			
			const oldInfo = this.pluginList[pluginKey];
			Reflect.deleteProperty( this.pluginList, pluginKey );
			Reflect.deleteProperty( this.pluginSettings, pluginKey );
			
			await this.loadSingle( pluginKey, immediate, reloadCmd, oldInfo.sortIndex );
			
			return {
				oldSetting,
				newSetting: this.pluginSettings[pluginKey]
			}
		} catch ( error ) {
			this.bot.logger.error( `插件 ${ pluginKey } 重载异常: ${ <string>error }` );
		}
	}
	
	public async reload() {
		const refresh = Refreshable.getInstance();
		const assetsUpdate = AssetsUpdate.getInstance();
		for ( const pluginKey in this.pluginSettings ) {
			await this.doUnMount( pluginKey );
			/* 卸载插件刷新事件 */
			refresh.logout( pluginKey );
			/* 关闭静态资源更新任务 */
			assetsUpdate.deregisterCheckUpdateJob( pluginKey );
		}
		const oldSettings = this.pluginSettings;
		this.pluginSettings = {};
		this.pluginList = {};
		
		await this.load();
		const serverInstance = RenderServer.getInstance();
		await serverInstance.reloadServer();
		return {
			oldSettings,
			newSettings: this.pluginSettings
		}
	}
	
	/* 卸载插件 */
	public async unLoadSingle( pluginKey: string, reloadCmd = true  ) {
		try {
			await this.doUnMount( pluginKey );
			const refresh = Refreshable.getInstance();
			refresh.logout( pluginKey );
			
			/* 关闭静态资源更新任务 */
			const assetsUpdate = AssetsUpdate.getInstance();
			assetsUpdate.deregisterCheckUpdateJob( pluginKey );
			
			const setting = this.pluginSettings[pluginKey];
			
			Reflect.deleteProperty( this.pluginList, pluginKey );
			Reflect.deleteProperty( this.pluginSettings, pluginKey );
			
			if ( reloadCmd ) {
				await this.bot.command.reload();
			}
			return setting;
		} catch ( error ) {
			this.bot.logger.error( `插件 ${ pluginKey } 卸载异常: ${ <string>error }` );
		}
	}
	
	/**
	 * 执行插件 mounted 钩子
	 * @param pluginKey 插件目录名
	 */
	public async doMount( pluginKey: string ) {
		const setting = this.pluginSettings[ pluginKey ];
		try {
			if ( setting.mounted ) {
				await setting.mounted( this.getPluginParameter( pluginKey ) );
			}
			return true;
		} catch ( error ) {
			Reflect.deleteProperty( this.pluginList, pluginKey );
			Reflect.deleteProperty( this.pluginSettings, pluginKey );
			this.bot.logger.error( `插件 ${ pluginKey } mounted 钩子执行异常: ${ <string>error }` );
			return false;
		}
	}
	
	/**
	 * 执行插件 unmounted 钩子
	 * @param pluginKey 插件路目录名
	 */
	public async doUnMount( pluginKey: string ) {
		const setting = this.pluginSettings[pluginKey];
		try {
			if ( setting.unmounted ) {
				await setting.unmounted( this.getPluginParameter( pluginKey ) );
			}
			return true;
		} catch ( error ) {
			this.bot.logger.error( `插件 ${ pluginKey } unmounted 钩子执行异常: ${ <string>error }` );
			return false;
		}
	}
	
	/* 通过别名获取插件信息 */
	public getPluginInfoByAlias( alias: string ) {
		return Object.values( this.pluginList ).filter( pluginInfo => {
			return pluginInfo.name === alias || pluginInfo.aliases.includes( alias );
		} );
	}
	
	/* 移除指定目标下的所有订阅 */
	public remSub( type: "private" | "group", targetId: number ) {
		for ( const pluginKey in this.pluginList ) {
			const { subscribe, name } = this.pluginList[pluginKey];
			try {
				if ( subscribe ) {
					for ( const { reSub } of subscribe ) {
						reSub( targetId, type, this.bot );
					}
				}
			} catch ( error ) {
				this.bot.logger.error( `插件${ name }取消订阅事件执行异常：${ <string>error }` )
			}
		}
	}
	
	public async parse( pluginKey: string, configData: Record<string, any> ): Promise<Record<string, any>> {
		const configList: Record<string, any> = {};
		const pluginInfo = this.pluginList[pluginKey];
		pluginInfo.commands = [];
		
		let cmdEntry: any = {};
		/* 此处删除所有向后兼容代码 */
		for ( const config of pluginInfo.cmdConfigs ) {
			/* 允许 main 传入函数 */
			if ( config.main instanceof Function ) {
				cmdEntry = config.main;
			} else {
				const main: string = config.main || "index";
				const entry = await import( `#/${ join( pluginInfo.key, main ) }` );
				cmdEntry = entry.default;
			}
			
			const initConfig: InitType = {
				...config,
				pluginName: pluginInfo.name,
				run: cmdEntry
			};
			
			const key: string = config.cmdKey;
			const loaded = configData[key];
			
			/* 读取 commands.yml 配置，创建指令实例  */
			try {
				let command: cmd.BasicConfig;
				switch ( initConfig.type ) {
					case "order":
						if ( loaded ) cmd.Order.read( initConfig, loaded );
						command = new cmd.Order( initConfig, this.bot.config );
						break;
					case "switch":
						if ( loaded ) cmd.Switch.read( initConfig, loaded );
						command = new cmd.Switch( initConfig, this.bot.config );
						break;
					case "enquire":
						if ( loaded ) cmd.Enquire.read( initConfig, loaded );
						command = new cmd.Enquire( initConfig, this.bot.config );
						break;
				}
				if ( !loaded || loaded.enable ) {
					pluginInfo.commands.push( command );
				}
				configList[key] = command.write();
			} catch ( error ) {
				this.bot.logger.error( <string>error );
			}
		}
		return configList;
	}
	
	/**
	 * 获取插件钩子函数参数
	 * @param key 插件目录名
	 * @private
	 */
	private getPluginParameter( key: string ): PluginParameter {
		const bot = this.bot;
		const that = this;
		const refresh = Refreshable.getInstance();
		return {
			...bot,
			setAlias( aliases ) {
				that.pluginList[ key ].aliases = aliases;
			},
			refreshRegister(
				fileNameOrTarget: string | RefreshTarget<"fun"> | RefreshTarget<"file">,
				target?: RefreshTarget<"file">,
				place: PresetPlace = "config",
			) {
				if ( typeof fileNameOrTarget === "string" ) {
					return refresh.register( fileNameOrTarget, target!, place, key );
				} else {
					return refresh.register( <any>fileNameOrTarget, key );
				}
			},
			configRegister( fileName, initCfg, setValueCallBack? ) {
				return bot.config.register( fileName, initCfg, setValueCallBack, key );
			},
			renderRegister( defaultSelector, baseUrl = "" ) {
				if ( baseUrl && !baseUrl.startsWith( "/" ) ) {
					baseUrl = "/" + baseUrl;
				}
				return bot.renderer.register( `/${ key }${ baseUrl }`, defaultSelector );
			}
		}
	}
}