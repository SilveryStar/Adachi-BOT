import { AuthLevel } from "./management/auth";
import FileManagement from "@modules/file";

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
	public readonly dbPort: number;
	public readonly dbPassword: string;
	public readonly inviteAuth: AuthLevel;
	public readonly countThreshold: number;
	public readonly groupIntervalTime: number;
	public readonly privateIntervalTime: number;
	public readonly helpMessageStyle: string;
	public readonly logLevel: "trace" | "debug" | "info" | "warn" |
							  "error" | "fatal" | "mark" | "off";
	
	public readonly webConsole: {
		readonly enable: boolean;
		readonly consolePort: number;
		readonly tcpLoggerPort: number;
		readonly jwtSecret: string;
	};
	
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
		inviteAuth: "master",
		countThreshold: 60,
		groupIntervalTime: 1500,
		privateIntervalTime: 2000,
		helpMessageStyle: "message",
		logLevel: "info",
		dbPort: 56379,
		dbPassword: "",
		webConsole: {
			enable: true,
			consolePort: 80,
			tcpLoggerPort: 54921,
			jwtSecret: ""
		}
	};
	
	constructor( file: FileManagement ) {
		const config: any = file.loadYAML( "setting" );
		const checkFields: Array<keyof BotConfig> = [ "atBOT", "addFriend", "dbPassword" ];
		
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
		this.platform = config.platform;
		this.password = config.password;
		this.groupIntervalTime = config.groupIntervalTime;
		this.privateIntervalTime = config.privateIntervalTime;
		this.countThreshold = config.countThreshold;
		this.webConsole = {
			enable: config.webConsole.enable,
			consolePort: config.webConsole.consolePort,
			tcpLoggerPort: config.webConsole.tcpLoggerPort,
			jwtSecret: config.webConsole.jwtSecret
		}
		
		this.inviteAuth = config.inviteAuth === "manager"
			? AuthLevel.Manager : AuthLevel.Master;
		
		const helpList: string[] = [ "message", "forward", "xml" ];
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