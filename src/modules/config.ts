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
	public readonly dbPort: number;
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
		qrcode: "true 启用扫码登录,每次登录都需验证,Docker 启动禁用,默认不启用",
		number: "QQ 账号",
		password: "QQ 密码",
		master: "BOT 持有者账号",
		header: "命令起始符(可为空串\"\")",
		platform: "1.安卓手机(默认) 2.aPad 3.安卓手表 4.MacOS 5.iPad",
		atUser: "true 启用回复 at 用户,默认关闭",
		inviteAuth: "邀请自动入群权限,master 表示 BOT持有者,manager 表示 BOT管理员,默认 master",
		countThreshold: "每小时指令使用次数阈值, 超过该值会向持有者发出提升, 默认 60",
		groupIntervalTime: "群聊指令操作冷却时间, 单位毫秒, 默认 1500ms",
		privateIntervalTime: "私聊指令操作冷却时间, 单位毫秒, 默认 2000ms",
		helpMessageStyle: "帮助信息样式, 分为 message, forward, xml 三种, 默认 message",
		logLevel: "日志等级, 默认 info",
		dbPort: 56379,
		webConsole: {
			enable: true,
			consolePort: 80,
			tcpLoggerPort: 54921,
			jwtSecret: "登录认证, 请随意输入长度为 6~16 的仅由字母和数字组成的字符串"
		}
	};
	
	constructor( file: FileManagement ) {
		const config = file.loadYAML( "setting" );
		
		this.qrcode = config.qrcode;
		this.number = config.number;
		this.master = config.master;
		this.header = config.header;
		this.dbPort = config.dbPort;
		this.password = config.password;
		this.webConsole = {
			enable: config.webConsole.enable,
			consolePort: config.webConsole.consolePort,
			tcpLoggerPort: config.webConsole.tcpLoggerPort,
			jwtSecret: config.webConsole.jwtSecret
		}
		
		this.atUser = typeof config.atUser !== "boolean"
					? false : config.atUser;
		this.platform = typeof config.platform === "string"
					  ? 1 : config.platform;
		this.inviteAuth = config.inviteAuth === "manager"
						? AuthLevel.Manager : AuthLevel.Master;
		this.groupIntervalTime = typeof config.groupIntervalTime !== "string"
							   ? config.groupIntervalTime : 1500;
		this.privateIntervalTime = typeof config.privateIntervalTime !== "string"
								 ? config.privateIntervalTime : 2000;
		this.countThreshold = typeof config.countThreshold !== "string"
							? config.countThreshold : 60;
		
		const helpList: string[] = [ "message", "forward", "xml" ];
		this.helpMessageStyle = helpList.includes( config.helpMessageStyle )
		                      ? config.helpMessageStyle : "message";
		
		const logLevelList: string[] = [ "trace", "debug", "info", "warn", "error", "fatal", "mark", "off" ];
		this.logLevel = logLevelList.includes( config.logLevel )
					  ? config.logLevel : "info";
	}
}