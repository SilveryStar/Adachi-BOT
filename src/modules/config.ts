import { AuthLevel } from "./management/auth";
import FileManagement from "@/modules/file";
import { getRandomString } from "@/utils/common";
import { LogLevel } from "icqq";
import bot from "ROOT";
import RefreshConfig, { RefreshCatch } from "@/modules/management/refresh";

export type BotConfigValue = Omit<typeof BotConfigManager.initConfig, "inviteAuth"> & {
	logLevel: LogLevel;
	inviteAuth: AuthLevel
}

export type BotConfig = Omit<BotConfigManager, "value"> & BotConfigValue

export class ConfigInstance<T extends Record<string, any>> {
	private readonly filename: string;
	private readonly setValueCallBack: ( config: T ) => T;
	public value: T;
	
	constructor( filename: string, cfg: T, setValueCallBack: ( config: T ) => T = config => config ) {
		this.filename = filename;
		this.value = setValueCallBack( cfg );
		this.setValueCallBack = setValueCallBack;
	}
	
	async refresh( config: T ) {
		try {
			this.value = this.setValueCallBack( config );
			return `${ this.filename }.yml 重新加载完毕`;
		} catch ( error ) {
			throw <RefreshCatch>{
				log: ( <Error>error ).stack,
				msg: `${ this.filename }.yml 重新加载失败，请前往控制台查看日志`
			};
		}
	}
}

export default class BotConfigManager {
	public readonly value: BotConfigValue;
	
	static initConfig = {
		tip: "前往 https://docs.adachi.top/config 查看配置详情",
		qrcode: false,
		number: 123456789,
		password: "",
		master: 987654321,
		header: "#",
		platform: 1,
		ffmpegPath: "",
		ffprobePath: "",
		atUser: false,
		atBOT: false,
		addFriend: true,
		useWhitelist: false,
		fuzzyMatch: false,
		matchPrompt: true,
		renderPort: 80,
		inviteAuth: "master",
		countThreshold: 60,
		ThresholdInterval: false,
		groupIntervalTime: 1500,
		privateIntervalTime: 2000,
		helpMessageStyle: "message",
		callTimes: 3,
		logLevel: "info",
		dbPort: 56379,
		dbPassword: "",
		mailConfig: {
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
		},
		banScreenSwipe: {
			enable: false,
			limit: 10,
			duration: 1800,
			prompt: true,
			promptMsg: "请不要刷屏哦~"
		},
		banHeavyAt: {
			enable: false,
			limit: 10,
			duration: 1800,
			prompt: true,
			promptMsg: "你at太多人了，会被讨厌的哦~"
		},
		webConsole: {
			enable: true,
			tcpLoggerPort: 54921,
			logHighWaterMark: 64,
			jwtSecret: getRandomString( 16 )
		},
		autoChat: {
			tip: "type参数说明：\n" +
				"1：青客云API，无需配置其他参数 \n" +
				"2：腾讯自然语言处理，需要前往腾讯云开通NLP并获取到你的secret（听说超级智能）\n" +
				"3：小爱智能语音，使用摹名Api：http://xiaoapi.cn，此时仅 enable 参数有效",
			enable: false,
			type: 1,
			audio: false,
			secretId: "",
			secretKey: ""
		}
	};
	
	constructor( file: FileManagement, refresh: RefreshConfig ) {
		const configInstance = this.register<BotConfigValue>( "setting", <any>BotConfigManager.initConfig, cfg => {
			if ( !cfg.webConsole.jwtSecret ) {
				cfg.webConsole.jwtSecret = getRandomString( 16 );
			}
			const authMap: Record<string, AuthLevel> = {
				master: AuthLevel.Master,
				manager: AuthLevel.Manager,
				user: AuthLevel.User
			}
			
			cfg.inviteAuth = authMap[cfg.inviteAuth] || AuthLevel.Master;
			
			const helpList: string[] = [ "message", "forward", "xml", "card" ];
			cfg.helpMessageStyle = helpList.includes( cfg.helpMessageStyle )
				? cfg.helpMessageStyle : "message";
			
			const logLevelList: string[] = [
				"trace", "debug", "info", "warn",
				"error", "fatal", "mark", "off"
			];
			cfg.logLevel = <any>( logLevelList.includes( cfg.logLevel )
				? cfg.logLevel : "info" );
			return cfg;
		}, file, refresh );
		
		this.value = configInstance;
	}
	
	public register<T extends Record<string, any>>(
		filename: string,
		initCfg: T,
		setValueCallBack: ( config: T ) => T = config => config,
		file: FileManagement = bot.file,
		refresh: RefreshConfig = bot.refresh
	): T {
		const path: string = file.getFilePath( `${ filename }.yml` );
		const isExist: boolean = file.isExist( path );
		let cfg: T;
		if ( isExist ) {
			const config: any = file.loadYAML( filename ) || {};
			cfg = this.resetConfigData( config, initCfg );
		} else {
			file.createYAML( filename, initCfg );
			cfg = initCfg;
		}
		const configInstance = new ConfigInstance( filename, cfg, setValueCallBack );
		
		file.writeYAML( filename, configInstance.value );
		refresh.registerRefreshableFile( filename, configInstance );
		
		return <T><any>( new Proxy( configInstance, {
			get( target: ConfigInstance<T>, p: string ): any {
				return configInstance.value[p];
			}
		} ) );
	}
	
	private resetConfigData<T extends Record<string, any>>( config: Record<string, any>, initCfg: T ): T {
		return <T>Object.fromEntries( Object.entries( initCfg ).map( ( [ k, v ] ) => {
			const curItem = config[k];
			if ( typeof v === "object" && v !== null ) {
				if ( !curItem ) {
					return [ k, v ];
				}
				return [ k, this.resetConfigData( curItem, v ) ];
			}
			return [ k, config[k] || v ];
		} ) );
		
	}
}