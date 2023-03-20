import { AuthLevel } from "./management/auth";
import FileManagement from "@modules/file";
import { getRandomStr } from "@modules/utils";

export default class BotConfig {
	public readonly qrcode: boolean;
	public readonly number: number;
	public readonly password: string;
	public readonly master: number;
	public readonly header: string;
	public readonly platform: 1 | 2 | 3 | 4 | 5;
	public readonly ffmpegPath: string;
	public readonly ffprobePath: string;
	public readonly atUser: boolean;
	public readonly atBOT: boolean;
	public readonly addFriend: boolean;
	public readonly useWhitelist: boolean;
	public readonly fuzzyMatch: boolean;
	public readonly matchPrompt: boolean;
	public readonly dbPort: number;
	public readonly dbPassword: string;
	public readonly inviteAuth: AuthLevel;
	public readonly countThreshold: number;
	public readonly ThresholdInterval: boolean;
	public readonly groupIntervalTime: number;
	public readonly privateIntervalTime: number;
	public readonly helpPort: number;
	public readonly helpMessageStyle: string;
	public readonly callTimes: number;
	public readonly logLevel: "trace" | "debug" | "info" | "warn" |
		"error" | "fatal" | "mark" | "off";
	
	public readonly banScreenSwipe: {
		readonly enable: boolean;
		readonly limit: number;
		readonly duration: number;
		readonly prompt: boolean;
		readonly promptMsg: string;
	}
	
	public readonly banHeavyAt: {
		readonly enable: boolean;
		readonly limit: number;
		readonly duration: number;
		readonly prompt: boolean;
		readonly promptMsg: string;
	}
	
	public readonly webConsole: {
		readonly enable: boolean;
		readonly consolePort: number;
		readonly tcpLoggerPort: number;
		readonly logHighWaterMark: number;
		readonly jwtSecret: string;
	};
	
	public readonly autoChat: {
		readonly enable: boolean;
		readonly type: number;
		readonly audio: boolean;
		readonly secretId: string;
		readonly secretKey: string;
	}
	
	static initObject = {
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
		inviteAuth: "master",
		countThreshold: 60,
		ThresholdInterval: false,
		groupIntervalTime: 1500,
		privateIntervalTime: 2000,
		helpPort: 54919,
		helpMessageStyle: "message",
		callTimes: 3,
		logLevel: "info",
		dbPort: 56379,
		dbPassword: "",
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
			consolePort: 80,
			tcpLoggerPort: 54921,
			logHighWaterMark: 64,
			jwtSecret: getRandomStr( 16 )
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
	
	constructor( file: FileManagement ) {
		const config: any = file.loadYAML( "setting" );
		const checkFields: Array<keyof BotConfig> = [
			"atBOT", "addFriend", "dbPassword",
			"helpPort", "autoChat", "callTimes",
			"fuzzyMatch", "matchPrompt", "useWhitelist",
			"banScreenSwipe", "banHeavyAt", "ThresholdInterval",
			"ffmpegPath", "ffprobePath"
		];
		
		for ( let key of checkFields ) {
			if ( config[key] === undefined ) {
				config[key] = BotConfig.initObject[key];
			}
		}
		file.writeYAML( "setting", config );
		
		this.atBOT = config.atBOT;
		this.qrcode = config.qrcode;
		this.number = config.number;
		this.master = config.master;
		this.header = config.header;
		this.dbPort = config.dbPort;
		this.dbPassword = config.dbPassword;
		this.atUser = config.atUser;
		this.addFriend = config.addFriend;
		this.useWhitelist = config.useWhitelist;
		this.autoChat = config.autoChat;
		this.fuzzyMatch = config.fuzzyMatch;
		this.matchPrompt = config.matchPrompt;
		this.platform = config.platform;
		this.ffmpegPath = config.ffmpegPath;
		this.ffprobePath = config.ffprobePath;
		this.password = config.password;
		this.helpPort = config.helpPort;
		this.callTimes = config.callTimes;
		this.groupIntervalTime = config.groupIntervalTime;
		this.privateIntervalTime = config.privateIntervalTime;
		this.countThreshold = config.countThreshold;
		this.ThresholdInterval = config.ThresholdInterval;
		if ( !config.webConsole.jwtSecret ) {
			config.webConsole.jwtSecret = getRandomStr( 16 );
			file.writeYAML( "setting", config );
		}
		this.banScreenSwipe = {
			enable: config.banScreenSwipe.enable,
			limit: config.banScreenSwipe.limit,
			duration: config.banScreenSwipe.duration,
			prompt: config.banScreenSwipe.prompt,
			promptMsg: config.banScreenSwipe.promptMsg
		}
		
		this.banHeavyAt = {
			enable: config.banHeavyAt.enable,
			limit: config.banHeavyAt.limit,
			duration: config.banHeavyAt.duration,
			prompt: config.banHeavyAt.prompt,
			promptMsg: config.banHeavyAt.promptMsg
		}
		
		this.webConsole = {
			enable: config.webConsole.enable,
			consolePort: config.webConsole.consolePort,
			tcpLoggerPort: config.webConsole.tcpLoggerPort,
			logHighWaterMark: config.webConsole.logHighWaterMark,
			jwtSecret: config.webConsole.jwtSecret?.toString()
		}
		
		const authMap: Record<string, AuthLevel> = {
			master: AuthLevel.Master,
			manager: AuthLevel.Manager,
			user: AuthLevel.User
		}
		
		this.inviteAuth = authMap[config.inviteAuth] || AuthLevel.Master;
		
		const helpList: string[] = [ "message", "forward", "xml", "card" ];
		this.helpMessageStyle = helpList.includes( config.helpMessageStyle )
			? config.helpMessageStyle : "message";
		
		const logLevelList: string[] = [
			"trace", "debug", "info", "warn",
			"error", "fatal", "mark", "off"
		];
		this.logLevel = logLevelList.includes( config.logLevel )
			? config.logLevel : "info";
	}
}