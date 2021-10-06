import { loadYAML } from "../utils/config";
import { AuthLevel } from "./auth";

class BotConfig {
	public readonly qrcode: boolean;
	public readonly number: number;
	public readonly password: string;
	public readonly master: number;
	public readonly header: string;
	public readonly platform: 1 | 2 | 3 | 4 | 5;
	public readonly atUser: boolean;
	public readonly intervalTime: number;
	public readonly dbPort: number;
	public readonly inviteAuth: AuthLevel;
	
	static initObject = {
		qrcode: "true 启用扫码登录,每次登录都需验证,Docker 启动禁用,默认不启用",
		number: "QQ 账号",
		password: "QQ 密码",
		master: "BOT 持有者账号",
		header: "命令起始符(可为空串\"\")",
		platform: "1.安卓手机(默认) 2.aPad 3.安卓手表 4.MacOS 5.iPad",
		atUser: "true 启用回复 at 用户,默认关闭",
		intervalTime: "指令操作CD,单位 ms,默认 1500ms",
		inviteAuth: "邀请自动入群权限,master 表示 BOT持有者,manager 表示 BOT管理员,默认 master",
		dbPort: 56379
	};
	
	constructor() {
		const config = loadYAML( "setting" );
		
		this.qrcode = config.qrcode;
		this.number = config.number;
		this.master = config.master;
		this.header = config.header;
		this.dbPort = config.dbPort;
		this.password = config.password;
		
		this.atUser = typeof config.atUser !== "boolean"
					? false : config.atUser;
		this.platform = typeof config.platform === "string"
					  ? 1 : config.platform;
		this.intervalTime = typeof config.intervalTime !== "number"
						  ? 1500 : config.intervalTime;
		this.inviteAuth = config.inviteAuth === "manager"
						? AuthLevel.Manager : AuthLevel.Master;
	}
}

export { BotConfig }