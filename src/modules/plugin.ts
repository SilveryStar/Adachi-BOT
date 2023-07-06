import * as cmd from "./command";
import { BasicConfig, InitType } from "./command";
import { BOT } from "@/modules/bot";
import { extname } from "path";
import { Router } from "express";
import axios, { AxiosError, AxiosResponse } from "axios";
import Progress from "@/utils/progress";
import { Renderer } from "@/modules/renderer";
import { compareAssembleObject, getObjectKeyValue, removeKeysStartsWith } from "@/utils/object";
import { isIgnorePath } from "@/utils/path";
import { parse, stringify } from "yaml";
import { isJsonString } from "@/utils/verify";
import { ExportConfig } from "@/modules/config";

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

export type PluginParameter = {
	renderRegister: ( defaultSelector: string ) => Renderer;
	configRegister: <T extends Record<string, any>>(
		fileName: string,
		initCfg: T,
		setValueCallBack?: ( config: T ) => T,
		refreshCallBack?: ( config: T ) => string | void
	) => ExportConfig<T>;
} & BOT;

export interface PluginInfo {
	key: string;
	name: string;
	upgrade?: string;
	aliases: string[];
	commands: BasicConfig[];
	cmdConfigs: cmd.ConfigType[];
	servers: ServerRouters[];
	renders: RenderRoutes[];
	subscribe: PluginSetting["subscribe"];
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

export type PluginHook = ( input: PluginParameter ) => void | Promise<void>;

type SubUser = {
	person?: number[];
	group?: number[];
};

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
	subscribe?: {
		name: string;
		getUser: ( bot: BOT ) => Promise<SubUser> | SubUser;
		reSub: ( userId: number, type: "private" | "group", bot: BOT ) => Promise<void> | void;
	}[];
	mounted?: PluginHook; // 钩子函数：插件加载完毕时触发
	unmounted?: PluginHook; // 钩子函数：插件卸载/重载时触发
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
	
	public async load( reload: boolean = false ): Promise<Record<string, PluginSetting>> {
		const plugins: string[] = this.bot.file.getDirFiles( "", "plugin" );
		
		/* 从 plugins 文件夹从导入 init.ts 进行插件初始化 */
		for ( let pluginKey of plugins ) {
			await this.loadSingle( pluginKey, reload );
		}
		await this.bot.command.reload();
		return this.pluginSettings;
	}
	
	/**
	 * 加载单个插件
	 * @param pluginKey 插件目录名
	 * @param reload 是否为插件重载
	 */
	public async loadSingle( pluginKey: string, reload: boolean = true ) {
		try {
			// 清楚指定插件的文件缓存
			removeKeysStartsWith( require.cache, this.bot.file.getFilePath( pluginKey, "plugin" ) );
			
			const init = await import( `#/${ pluginKey }/init.ts` );
			const {
				name: pluginName,
				renderer,
				server,
				cfgList,
				repo,
				aliases,
				assets,
				subscribe,
				mounted
			}: PluginSetting = init.default;
			
			// 检查更新插件静态资源
			await this.checkUpdate( pluginKey, pluginName, assets );
			
			const plugin: PluginInfo = {
				key: pluginKey,
				name: pluginName,
				aliases: aliases || [],
				commands: [],
				cmdConfigs: cfgList,
				servers: [],
				renders: [],
				subscribe
			}
			
			// 加载前端渲染页面路由
			if ( renderer ) {
				const renderDir = getObjectKeyValue( renderer, "dirname", "views" );
				const mainFiles = getObjectKeyValue( renderer, "mainFiles", [ "index" ] );
				const views = this.bot.file.getDirFiles( `${ pluginKey }/${ renderDir }`, "plugin" );
				views.forEach( v => {
					const route = this.setRenderRoute( pluginKey, renderDir, mainFiles, v );
					if ( route ) {
						plugin.renders.push( route );
					}
				} );
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
			
			/* 仅重载时直接执行生命周期钩子 */
			if ( reload ) {
				// 生命周期：插件加载完成
				const mountState = await this.doMount( pluginKey );
				if ( !mountState ) {
					throw new Error( `插件 ${ pluginKey } mounted 钩子执行异常` );
				}
				await this.bot.command.reload();
			}
			
			this.bot.logger.info( `插件 ${ pluginName } 加载完成` );
			
			this.pluginList[pluginKey] = plugin;
			this.pluginSettings[pluginKey] = init.default;
		} catch ( error ) {
			this.bot.logger.error( `插件 ${ pluginKey } 加载异常: ${ <string>error }` );
		}
	}
	
	public async reloadSingle( pluginKey: string, reload: boolean = true ) {
		try {
			const oldSetting = this.pluginSettings[pluginKey];
			if ( oldSetting.unmounted ) {
				oldSetting.unmounted( this.getPluginParameter( pluginKey ) );
			}
			Reflect.deleteProperty( this.pluginList, pluginKey );
			Reflect.deleteProperty( this.pluginSettings, pluginKey );
			await this.loadSingle( pluginKey, reload );
			return {
				oldSetting,
				newSetting: this.pluginSettings[pluginKey]
			}
		} catch ( error ) {
			this.bot.logger.error( `插件 ${ pluginKey } 重载异常: ${ <string>error }` );
		}
	}
	
	public async reload() {
		for ( const pluginKey in this.pluginSettings ) {
			await this.doUnMount( pluginKey );
		}
		const oldSettings = this.pluginSettings;
		this.pluginSettings = {};
		this.pluginList = {};
		await this.load( true );
		return {
			oldSettings,
			newSettings: this.pluginSettings
		}
	}
	
	/* 卸载插件 */
	public async unLoadSingle( pluginKey: string ) {
		try {
			await this.doUnMount( pluginKey );
			const setting = this.pluginSettings[pluginKey];
			
			Reflect.deleteProperty( this.pluginList, pluginKey );
			Reflect.deleteProperty( this.pluginSettings, pluginKey );
			await this.bot.command.reload();
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
	
	/* 移除指定目标下的指定插件的所有订阅 */
	public remPluginSub( { subscribe, name }: PluginInfo, type: "private" | "group", targetId: number ) {
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
	
	/* 移除指定目标下的所有订阅 */
	public remSub( type: "private" | "group", targetId: number ) {
		for ( const pluginKey in this.pluginList ) {
			this.remPluginSub( this.pluginList[pluginKey], type, targetId );
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
			if ( typeof config.main === "string" ) {
				const main: string = config.main || "index";
				const entry = await import(`#/${ pluginInfo.key }/${ main }`);
				cmdEntry = entry.default;
			} else {
				cmdEntry = config.main;
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
		return {
			...bot,
			configRegister( fileName, initCfg, setValueCallBack?, refreshCallBack? ) {
				return bot.config.register( `${ key }/${ fileName }`, initCfg, setValueCallBack );
			},
			renderRegister( defaultSelector ) {
				return bot.renderer.register( `/${ key }`, defaultSelector );
			}
		}
	}
	
	/**
	 * todo: 未实现删除被移除的文件
	 * 1、获取本地清单文件内容 manifestData
	 * 2、传递本地清单文件调用接口，接口：获取线上清单目录文件，diff算法对比两个清单文件差异性，返回差异性部分
	 * 3、依次下载清单文件列表文件，每下载完成一个时更新 manifestData 内容
	 * 4、下载完毕后以 manifestData 内容更新本地清单文件
	 */
	private async checkUpdate( plugin: string, pluginName: string, assets: PluginSetting["assets"] ): Promise<void> {
		if ( !assets ) return;
		const commonUrl = `assets/${ plugin }`;
		const baseUrl = `public/${ commonUrl }`;
		const manifestName = `${ baseUrl }/manifest`;
		// 该清单列表中的文件内容不会进行覆盖，仅做更新处理
		const ignoreName = `${ baseUrl }/.adachiignore`;
		
		const { path: ignorePath } = this.bot.file.createFile( ignoreName, "", "root" );
		
		const manifest = <IOssListObject[]>( this.bot.file.loadYAML( manifestName, "root" ) || [] );
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
				this.bot.logger.error( `检查更新失败，远程服务器异常：${ <string>error }` )
			}
		}
		// 不存在更新项，返回
		if ( !data.length ) {
			this.bot.logger.info( `未检测到 ${ pluginName } 可更新静态资源` );
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
			const isIgnore = isIgnorePath( ignorePath, this.bot.file.getFilePath( `${ baseUrl }/${ filePath }`, "root" ) );
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
					await this.bot.file.downloadFile( file.url, pathList, data => {
						// 不再忽略清单文件中时直接返回原数据
						if ( !isIgnore ) {
							return data;
						}
						// 对仅更新新内容不覆盖原内容的文件数据进行处理
						const onlineData: string = data.toString();
						const oldFileData = this.bot.file.loadFile( pathList[0], "root" );
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
						const newFileData = compareAssembleObject( oldValue, newValue, false, "merge" );
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
				progress.renderer( downloadNum, `下载失败：${ errorNum }`, this.bot.config.webConsole.enable );
			} )() );
		} );
		
		// 不存在更新项，返回
		if ( !updatePromiseList.length ) {
			this.bot.logger.info( `未检测到 ${ pluginName } 可更新静态资源` );
			return;
		}
		
		// 重新设置进度条长度
		progress.setTotal( updatePromiseList.length );
		
		// 遍历下载资源文件
		await Promise.all( updatePromiseList );
		
		// 写入清单文件
		this.bot.file.writeYAML( manifestName, manifest, "root" );
	}
	
	/* 获取插件渲染页的路由对象 */
	private setRenderRoute( plugin: string, renderDir: string, mainFiles: string[], view: string ): RenderRoutes | null {
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
			const fileType = this.bot.file.getFileType( `${ plugin }/${ renderDir }/${ view }`, "plugin" );
			if ( fileType === "directory" ) {
				for ( const mainFile of mainFiles ) {
					const path: string = this.bot.file.getFilePath( `${ plugin }/${ renderDir }/${ view }/${ mainFile }.vue`, "plugin" );
					// 判断目录下是否存在 mainFile
					const isExist: boolean = this.bot.file.isExist( path );
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
}