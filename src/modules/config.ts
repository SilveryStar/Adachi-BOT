import { AuthLevel } from "./management/auth";
import FileManagement from "@/modules/file";
import bot from "ROOT";
import RefreshConfig, { RefreshCatch } from "@/modules/management/refresh";
import { getRandomString } from "@/utils/random";
import { compareAssembleObject, isEqualObject } from "@/utils/object";
import { LogLevel } from "@/modules/lib";

// 基本设置
const initBase = {
	tip: "前往 https://docs.adachi.top/config 查看配置详情",
	wsServer: process.env.docker === "yes" ? "adachi-go-cqhttp:80" : "127.0.0.1:11451",
	master: 987654321,
	inviteAuth: 2,
	logLevel: "info",
	atUser: false,
	atBOT: false,
	addFriend: true,
	apiTimeout: 20000,
	renderPort: 80
}

// 指令设置
const initDirective = {
	tip: "前往 https://docs.adachi.top/config 查看配置详情",
	header: [ "#" ],
	groupIntervalTime: 1500,
	privateIntervalTime: 2000,
	helpMessageStyle: "message",
	fuzzyMatch: false,
	matchPrompt: true,
	concurrency: 10,
	callTimes: 3,
	countThreshold: 60,
	ThresholdInterval: false
}

// 数据库设置
const initDB = {
	tip: "前往 https://docs.adachi.top/config 查看配置详情",
	port: process.env.docker === "yes" ? 56379 : 6379,
	password: ""
}

// 发件人邮箱配置
const initMail = {
	tip: "前往 https://docs.adachi.top/config 查看配置详情",
	host: "smtp.qq.com",
	port: 587,
	user: "123456789@qq.com",
	pass: "",
	secure: false,
	servername: "",
	rejectUnauthorized: false,
	logoutSend: false,
	sendDelay: 5,
	retry: 3,
	retryWait: 5
}

// 自动聊天设置
const initAutoChat = {
	tip: "前往 https://docs.adachi.top/config 查看配置详情",
	enable: false,
	type: 1,
	audio: false,
	secretId: "",
	secretKey: ""
}

// 白名单配置
const initWhiteList = {
	tip: "前往 https://docs.adachi.top/config 查看配置详情",
	enable: false,
	user: [ "（用户QQ）" ],
	group: [ "（群号）" ]
}

// 刷屏控制
const initBanScreenSwipe = {
	tip: "前往 https://docs.adachi.top/config 查看配置详情",
	enable: false,
	limit: 10,
	duration: 1800,
	prompt: true,
	promptMsg: "请不要刷屏"
}

// 过量at限制
const initBanHeavyAt = {
	tip: "前往 https://docs.adachi.top/config 查看配置详情",
	enable: false,
	limit: 10,
	duration: 1800,
	prompt: true,
	promptMsg: "请不要同时at太多人"
}

// 网站控制台相关
const initWebConsole = {
	tip: "前往 https://docs.adachi.top/config 查看配置详情",
	enable: true,
	tcpLoggerPort: 54921,
	logHighWaterMark: 64,
	jwtSecret: getRandomString( 16 )
}

export type ExportConfig<T extends Record<string, any>> = T & Omit<ConfigInstance<T>, "value" | "refresh">

export interface BotConfigValue {
	base: ExportConfig<Omit<typeof initBase, "tip" | "inviteAuth"> & {
		logLevel: LogLevel;
		inviteAuth: AuthLevel
	}>;
	directive: ExportConfig<Omit<typeof initDirective, "tip">>;
	db: ExportConfig<Omit<typeof initDB, "tip">>;
	mail: ExportConfig<Omit<typeof initMail, "tip">>;
	autoChat: ExportConfig<Omit<typeof initAutoChat, "tip">>;
	whiteList: ExportConfig<Omit<typeof initWhiteList, "tip" | "user" | "group"> & {
		user: number[];
		group: number[];
	}>;
	banScreenSwipe: ExportConfig<Omit<typeof initBanScreenSwipe, "tip">>;
	banHeavyAt: ExportConfig<Omit<typeof initBanHeavyAt, "tip">>;
	webConsole: ExportConfig<Omit<typeof initWebConsole, "tip">>;
}

interface BotConfigManagerImplement {
	readonly value: BotConfigValue,
	register<T extends Record<string, any>>(
		filename: string,
		initCfg: T,
		setValueCallBack?: ( config: T ) => T,
		pluginName?: string
	) : ExportConfig<T>
}

export type BotConfig = Omit<BotConfigManagerImplement, "value"> & BotConfigValue;

type EventType = "refresh";
type EventHandle<T> = ( newCfg: T, oldCfg: T ) => any;

class ConfigInstance<T extends Record<string, any>> {
	private readonly filename: string;
	private readonly setValueCallBack: ( config: T ) => T;
	private readonly eventListeners: Map<EventType, ( EventHandle<T> )[]> = new Map();
	public value: T;
	
	constructor(
		filename: string,
		cfg: T,
		setValueCallBack: ( config: T ) => T = config => config
	) {
		this.filename = filename;
		this.value = setValueCallBack( cfg );
		this.setValueCallBack = setValueCallBack;
	}
	
	async refresh( config: T ) {
		try {
			const newValue = this.setValueCallBack( config );
			const oldValue = this.value;
			this.value = newValue;
			
			// 未发生变化则不执行刷新
			if ( isEqualObject( newValue, oldValue ) ) {
				return "";
			}
			
			// 是否存在新的自定义返回值
			const diyTips: string[] = [];
			
			let handleError = false;
			const doHandle = async ( type: EventType ) => {
				const handles = this.eventListeners.get( type ) || [];
				for ( const handler of handles ) {
					try {
						const tip = await handler( newValue, oldValue );
						if ( type === "refresh" && typeof tip === "string" ) {
							diyTips.push( tip );
						}
					} catch ( error ) {
						bot.logger.error( "刷新配置文件回调执行出错：" + ( <Error>error ).stack )
						handleError = true;
					}
				}
			}
			
			await doHandle( "refresh" );
			// 当刷新监听器方法列表中存在返回字符串类型的回调，返回新的自定义字符串
			if ( diyTips.length ) {
				handleError && diyTips.push( "，部分回调执行异常，建议重试" );
				return diyTips.join( "\n" );
			}
			return `${ this.filename }.yml 重新加载完毕${ handleError ? "，部分回调执行异常，建议重试" : "" }`;
		} catch ( error ) {
			throw <RefreshCatch>{
				log: ( <Error>error ).stack,
				msg: `${ this.filename }.yml 重新加载失败，请前往控制台查看日志`
			};
		}
	}
	
	on( type: EventType, handle: EventHandle<T> ) {
		const handlers = this.eventListeners.get( type );
		if ( handlers ) {
			handlers.push( handle );
		} else {
			this.eventListeners.set( type, [ handle ] );
		}
	}
	
	clear( type?: EventType ) {
		if ( type ) {
			this.eventListeners.delete( type );
		} else {
			this.eventListeners.clear();
		}
	}
}

export default class BotConfigManager implements BotConfigManagerImplement {
	public readonly value: BotConfigValue;
	
	constructor() {
		const registerConfig = <T extends BotConfigValue[keyof BotConfigValue]>(
			filename: string,
			initCfg: T,
			setValueCallBack: ( config: T ) => T = config => config
		) => {
			return this.register<T>( filename, initCfg, setValueCallBack );
		};
		
		this.value = {
			base: registerConfig<BotConfigValue["base"]>( "base", <any>initBase, cfg => {
				cfg.inviteAuth = AuthLevel[cfg.inviteAuth] && cfg.inviteAuth !== 0 ? cfg.inviteAuth : AuthLevel.Master;
				
				const logLevelList: string[] = [
					"trace", "debug", "info", "warn",
					"error", "fatal", "mark", "off"
				];
				cfg.logLevel = <any>( logLevelList.includes( cfg.logLevel )
					? cfg.logLevel : "info" );
				return cfg;
			} ),
			directive: registerConfig<BotConfigValue["directive"]>( "directive", <any>initDirective, cfg => {
				if ( !( ( <any>cfg.header ) instanceof Array ) ) {
					cfg.header = [ "#" ];
				}
				const helpList: string[] = [ "message", "forward", "xml", "card" ];
				cfg.helpMessageStyle = helpList.includes( cfg.helpMessageStyle )
					? cfg.helpMessageStyle : "message";
				return cfg;
			} ),
			db: registerConfig<BotConfigValue["db"]>( "db", <any>initDB ),
			mail: registerConfig<BotConfigValue["mail"]>( "mail", <any>initMail ),
			autoChat: registerConfig<BotConfigValue["autoChat"]>( "autoChat", <any>initAutoChat ),
			whiteList: registerConfig<BotConfigValue["whiteList"]>( "whiteList", <any>initWhiteList, cfg => {
				cfg.user = cfg.user.filter( ( w: number | string ) => typeof w === "number" );
				cfg.group = cfg.group.filter( ( w: number | string ) => typeof w === "number" );
				return cfg;
			} ),
			banScreenSwipe: registerConfig<BotConfigValue["banScreenSwipe"]>( "banScreenSwipe", <any>initBanScreenSwipe ),
			banHeavyAt: registerConfig<BotConfigValue["banHeavyAt"]>( "banHeavyAt", <any>initBanHeavyAt ),
			webConsole: registerConfig<BotConfigValue["webConsole"]>( "webConsole", <any>initWebConsole, cfg => {
				if ( !cfg.jwtSecret ) {
					cfg.jwtSecret = getRandomString( 16 );
				}
				return cfg;
			} )
		}
	}
	
	public register<T extends Record<string, any>>(
		filename: string,
		initCfg: T,
		setValueCallBack: ( config: T ) => T = config => config,
		pluginName?: string
	) {
		if ( pluginName ) {
			filename = `${ pluginName }/${ filename }`;
		}
		const file = FileManagement.getInstance();
		const path: string = file.getFilePath( `${ filename }.yml` );
		const isExist: boolean = file.isExistSync( path );
		let cfg: T;
		if ( isExist ) {
			const config: any = file.loadYAMLSync( filename ) || {};
			cfg = compareAssembleObject( config, initCfg );
		} else {
			file.createYAMLSync( filename, initCfg );
			cfg = initCfg;
		}
		const configInstance = new ConfigInstance( filename, cfg, setValueCallBack );
		
		file.writeYAMLSync( filename, configInstance.value );
		const refresh = RefreshConfig.getInstance();
		refresh.register( filename, configInstance, undefined, pluginName );
		
		return <ExportConfig<T>><any>( new Proxy( configInstance, {
			get( target: ConfigInstance<T>, p: string ): any {
				if ( p in configInstance.value ) {
					return configInstance.value[p];
				}
				if ( p !== "value" && p !== "refresh" ) {
					return target[p];
				}
				return undefined;
			}
		} ) );
	}
}