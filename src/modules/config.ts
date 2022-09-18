import { AuthLevel } from "./management/auth";
import FileManagement from "@modules/file";
import { randomSecret } from "@modules/utils";

export default class BotConfig {
	public readonly qrcode: boolean;
	public readonly number: number;
	public readonly password: string;
	public readonly master: number;
	public readonly header: string;
	public readonly platform: 1 | 2 | 3 | 4 | 5;
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
	public readonly groupIntervalTime: number;
	public readonly privateIntervalTime: number;
	public readonly helpPort: number;
	public readonly helpMessageStyle: string;
	public readonly callTimes: number;
	public readonly logLevel: "trace" | "debug" | "info" | "warn" |
		"error" | "fatal" | "mark" | "off";
	
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
		atUser: false,
		atBOT: false,
		addFriend: true,
		useWhitelist: false,
		fuzzyMatch: false,
		matchPrompt: true,
		inviteAuth: "master",
		countThreshold: 60,
		groupIntervalTime: 1500,
		privateIntervalTime: 2000,
		helpPort: 54919,
		helpMessageStyle: "message",
		callTimes: 3,
		logLevel: "info",
		dbPort: 56379,
		dbPassword: "",
		webConsole: {
			enable: true,
			consolePort: 80,
			tcpLoggerPort: 54921,
			logHighWaterMark: 64,
			jwtSecret: randomSecret( 16 )
		},
		autoChat: {
			tip1: "type参数说明：1为青云客，不用配置后面的两个secret，",
			tip2: "2为腾讯自然语言处理，需要前往腾讯云开通NLP并获取到你的secret（听说超级智能）",
			enable: false,
			type: 1,
			secretId: "",
			secretKey: ""
		}
	};
	
	constructor( file: FileManagement ) {
		const config: any = file.loadYAML( "setting" );
		const checkFields: Array<keyof BotConfig> = [
			"atBOT", "addFriend", "dbPassword",
			"helpPort", "autoChat", "callTimes",
			"fuzzyMatch", "matchPrompt", "useWhitelist"
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
		this.password = config.password;
		this.helpPort = config.helpPort;
		this.callTimes = config.callTimes;
		this.groupIntervalTime = config.groupIntervalTime;
		this.privateIntervalTime = config.privateIntervalTime;
		this.countThreshold = config.countThreshold;
		if ( !config.webConsole.jwtSecret ) {
			config.webConsole.jwtSecret = randomSecret( 16 );
			file.writeYAML( "setting", config );
		}
		this.webConsole = {
			enable: config.webConsole.enable,
			consolePort: config.webConsole.consolePort,
			tcpLoggerPort: config.webConsole.tcpLoggerPort,
			logHighWaterMark: config.webConsole.logHighWaterMark,
			jwtSecret: config.webConsole.jwtSecret
		}
		
		this.inviteAuth = config.inviteAuth === "manager"
			? AuthLevel.Manager : AuthLevel.Master;
		
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