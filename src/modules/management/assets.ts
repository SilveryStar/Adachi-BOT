import { PluginAssetsSetting } from "@/modules/plugin";
import { compareAssembleObject, getObjectKeyValue } from "@/utils/object";
import axios, { AxiosError } from "axios";
import FileManagement from "@/modules/file";
import { BotConfig } from "@/modules/config";
import { Logger } from "log4js";
import { parse, stringify } from "yaml";
import { isIgnorePath } from "@/utils/path";
import { extname } from "path";
import pLimit from "p-limit";
import Progress from "@/utils/progress";
import { isJsonString } from "@/utils/verify";
import { scheduleJob } from "node-schedule";
import { getRandomNumber } from "@/utils/random";

export interface IOssListObject {
	name: string;
	url: string;
	lastModified: string;
	etag: string;
	type: string;
	size: number;
	storageClass: string;
	owner: null;
}

export interface AssetsLifeCycle {
	noUpdated?: () => any;
	startUpdate?: () => any;
	updateError?: ( error: AxiosError ) => any;
}

interface AssetsJobInfo {
	pluginKey?: string;
	baseUrl?: string;
	pluginName: string;
	assets: PluginAssetsSetting;
	lifeCycle?: AssetsLifeCycle;
}

export default class AssetsUpdate {
	private static __instance: AssetsUpdate | null;
	private jobMap: Map<string, AssetsJobInfo> = new Map();
	
	constructor(
		private file: FileManagement,
		private config: BotConfig["webConsole"],
		private logger: Logger
	) {
		scheduleJob( "0 0 */6 * * *", () => {
			this.jobMap.forEach( el => {
				// 从一小时内随机取一段时间检查更新
				const time = Date.now() + getRandomNumber( 0, 60 * 60 * 1000 );
				scheduleJob( time, () => this.checkUpdate(
					el.pluginKey,
					el.baseUrl,
					el.pluginName,
					el.assets,
					el.lifeCycle
				) )
			} );
		} );
	}
	
	public static getInstance( file?: FileManagement, config?: BotConfig["webConsole"], logger?: Logger ): AssetsUpdate {
		if ( !AssetsUpdate.__instance ) {
			if ( !file || !config || !logger ) {
				throw new Error( "Invalid parameter" );
			}
			AssetsUpdate.__instance = new AssetsUpdate( file, config, logger );
		}
		return AssetsUpdate.__instance;
	}
	
	/** 获取更新文件列表 */
	private async getUpdateItems( assets: PluginAssetsSetting, manifest: IOssListObject[], pathField: string, lifeCycle?: AssetsLifeCycle ): Promise<IOssListObject[]> {
		const modifiedField = getObjectKeyValue( assets, "modifiedField", "lastModified" );
		
		let data: IOssListObject[];
		try {
			const res = await axios.post( "https://api-kozakura.marrydream.top/common/adachi/v1/oss/update/files", {
				url: assets.manifestUrl,
				list: manifest,
				pathField,
				modifiedField
			}, {
				maxContentLength: Infinity
			} );
			data = res.data.data;
		} catch ( error: any ) {
			const errRes = <AxiosError>error;
			if ( errRes.response?.status === 415 ) {
				if ( assets.overflowHandle ) {
					await assets.overflowHandle( assets );
				} else {
					const errorMsg: string = "更新文件数量超过阈值，请手动更新资源包";
					if ( lifeCycle?.updateError ) {
						errRes.message = errorMsg;
						await lifeCycle.updateError( errRes );
					} else {
						throw errorMsg;
					}
				}
			} else {
				const errorMsg = `检查更新失败，远程服务器异常，请联系开发者解决：${ ( <AxiosError>error ).response?.data?.["msg"] || <string>error }`;
				if ( lifeCycle?.updateError ) {
					errRes.message = errorMsg;
					await lifeCycle.updateError( errRes );
				} else {
					this.logger.error( errorMsg );
				}
			}
			data = [];
		}
		return data;
	}
	
	/** 下载单个文件 */
	private async downloadHandle( filePath: string, downloadUrl: string, isIgnore: boolean ) {
		try {
			const pathList = [ filePath ];
			const fileExt = extname( downloadUrl ).slice( 1 );
			
			await this.file.downloadFile( downloadUrl, pathList, async data => {
				// 不再忽略清单文件中时直接返回原数据
				if ( !isIgnore ) {
					return data;
				}
				// 对仅更新新内容不覆盖原内容的文件数据进行处理
				const onlineData: string = data.toString();
				const oldFileData = await this.file.loadFile( pathList[0], "plugin" ) || "";
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
			}, "plugin" );
		} catch ( error ) {
			throw error;
		}
	}
	
	public deregisterCheckUpdateJob( key: string ) {
		this.jobMap.delete( key );
	}
	
	public async registerCheckUpdateJob( pluginKey: string, baseUrl: undefined, pluginName: string, assets: PluginAssetsSetting, lifeCycle?: AssetsLifeCycle ): Promise<void>;
	public async registerCheckUpdateJob( pluginKey: undefined, baseUrl: string, pluginName: string, assets: PluginAssetsSetting, lifeCycle?: AssetsLifeCycle ): Promise<void>;
	public async registerCheckUpdateJob( pluginKey: string | undefined, baseUrl: string | undefined, pluginName: string, assets: PluginAssetsSetting, lifeCycle?: AssetsLifeCycle ): Promise<void> {
		const jobKey = <string>( pluginKey || baseUrl );
		if ( !this.jobMap.has( jobKey ) ) {
			this.jobMap.set( <string>( pluginKey || baseUrl ), {
				pluginKey,
				baseUrl,
				pluginName,
				assets,
				lifeCycle
			} );
		}
		await this.checkUpdate( pluginKey, baseUrl, pluginName, assets, lifeCycle );
	}
	
	/**
	 * todo: 未实现删除被移除的文件
	 * 1、获取本地清单文件内容 manifestData
	 * 2、传递本地清单文件调用接口，接口：获取线上清单目录文件，diff算法对比两个清单文件差异性，返回差异性部分
	 * 3、依次下载清单文件列表文件，每下载完成一个时更新 manifestData 内容
	 * 4、下载完毕后以 manifestData 内容更新本地清单文件
	 */
	private async checkUpdate( pluginKey: string | undefined, baseUrl: string | undefined, pluginName: string, assets: PluginAssetsSetting, lifeCycle?: AssetsLifeCycle ): Promise<void> {
		if ( !baseUrl ) {
			const downloadFolder = getObjectKeyValue( assets, "folderName", "adachi-assets" );
			baseUrl = `${ pluginKey }/${ downloadFolder }`;
		}
		// 该清单列表中的文件内容不会进行覆盖，仅做更新处理
		const ignoreName = `${ baseUrl }/.adachiignore`;
		
		const { path: ignorePath } = await this.file.createFile( ignoreName, "", "plugin" );
		
		const pathField = getObjectKeyValue( assets, "pathField", "name" );
		
		const manifestName = `${ baseUrl }/manifest`;
		const manifest = <IOssListObject[]>( await this.file.loadYAML( manifestName, "plugin" ) || [] );
		const data = await this.getUpdateItems( assets, manifest, pathField, lifeCycle );
		
		// 不存在更新项，返回
		if ( !data.length ) {
			this.logger.info( `未检测到 ${ pluginName } 可更新静态资源` );
			if ( lifeCycle?.noUpdated ) {
				await lifeCycle.noUpdated();
			}
			return;
		}
		
		const progress = new Progress( `下载 ${ pluginName } 静态资源`, data.length );
		
		// 更新图片promise列表
		const updatePromiseList: Promise<void>[] = [];
		
		// 最大下载并发数 10
		const limiter = pLimit( 10 );
		let downloadNum: number = 0, errorNum: number = 0;
		
		data.forEach( file => {
			const replacePath = getObjectKeyValue( assets, "replacePath", null );
			const filePath: string = file[pathField];
			
			/* 获取文件下载 url，处理用户传入的 url 可能存在的格式不规范问题 */
			let downloadUrl = assets.downloadBaseUrl + filePath;
			if ( assets.downloadBaseUrl.endsWith( "/" ) && filePath.startsWith( "/" ) ) {
				downloadUrl = assets.downloadBaseUrl + filePath.slice( 1 );
			}
			if ( !assets.downloadBaseUrl.endsWith( "/" ) && !filePath.startsWith( "/" ) ) {
				downloadUrl = assets.downloadBaseUrl + "/" + filePath;
			}
			
			/* 修改格式化后的文件路径 */
			const fileRealPath = `${ baseUrl }/${ replacePath ? replacePath( filePath ) : filePath }`;
			
			// 是否为清单排除文件
			const isIgnore = isIgnorePath( ignorePath, this.file.getFilePath( fileRealPath, "plugin" ) );
			const noOverrideList = getObjectKeyValue( assets, "noOverride", [ "yml", "json" ] )
			
			const fileExt = extname( downloadUrl ).slice( 1 );
			// 位于排除文件中，不进行更新
			if ( isIgnore && !noOverrideList.includes( fileExt ) ) {
				return;
			}
			updatePromiseList.push( limiter( () => this.downloadHandle( fileRealPath, downloadUrl, isIgnore ).then( () => {
				// 下载成功后新增清单项
				// 若清单项已存在则先删除再添加
				const key = manifest.findIndex( item => item[pathField] === file[pathField] )
				if ( key !== -1 ) {
					manifest.splice( key, 1, file );
				} else {
					manifest.push( file );
				}
			} ).catch( () => {
				errorNum++;
			} ).finally( () => {
				downloadNum++;
				progress.renderer( downloadNum, `下载失败：${ errorNum }`, this.config.enable );
			} ) ) );
		} );
		
		// 不存在更新项，返回
		if ( !updatePromiseList.length ) {
			this.logger.info( `未检测到 ${ pluginName } 可更新静态资源` );
			if ( lifeCycle?.noUpdated ) {
				await lifeCycle.noUpdated();
			}
			return;
		}
		
		if ( lifeCycle?.startUpdate ) {
			await lifeCycle.startUpdate();
		}
		
		// 重新设置进度条长度
		progress.setTotal( updatePromiseList.length );
		// 遍历下载资源文件
		await Promise.all( updatePromiseList );
		// 写入清单文件
		await this.file.writeYAML( manifestName, manifest, "plugin" );
	}
}