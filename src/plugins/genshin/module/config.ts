import { RefreshCatch } from "@modules/management/refresh";
import { randomString } from "#genshin/utils/random";

export default class GenshinConfig {
	public cardWeaponStyle: "normal" | "weaponA" | "weaponB";
	public cardProfile: "user" | "random";
	public serverPort: number;
	public showCharScore: boolean | number[];
	public wishLimitNum: number;
	public verifyEnable: boolean;
	public verifyRepeat: number;
	public verifyToken: string;
	
	public static init = {
		tip: "verify相关:\n" +
			"verifyEnable: 验证码服务总开关，true开启，false关闭\n" +
			"verifyRepeat: 验证码有概率失败，重试次数，推荐设置 1\n" +
			"verifyToken: 验证码服务Token，前往 https://challenge.minigg.cn/ 购买",
		cardWeaponStyle: "normal",
		cardProfile: "random",
		serverPort: 58612,
		showCharScore: true,
		wishLimitNum: 99,
		verifyEnable: false,
		verifyRepeat: 1,
		verifyToken: randomString( 6 )
	};
	
	constructor( config: any ) {
		this.cardWeaponStyle = config.cardWeaponStyle;
		this.cardProfile = config.cardProfile;
		this.serverPort = config.serverPort;
		this.showCharScore = config.showCharScore;
		this.wishLimitNum = config.wishLimitNum;
		this.verifyEnable = config.verifyEnable;
		this.verifyRepeat = config.verifyRepeat;
		this.verifyToken = config.verifyToken;
	}
	
	public async refresh( config ): Promise<string> {
		try {
			this.cardWeaponStyle = config.cardWeaponStyle;
			this.cardProfile = config.cardProfile;
			this.showCharScore = config.showCharScore;
			this.wishLimitNum = config.wishLimitNum;
			this.verifyEnable = config.verifyEnable;
			this.verifyRepeat = config.verifyRepeat;
			this.verifyToken = config.verifyToken;
			return "genshin.yml 重新加载完毕";
		} catch ( error ) {
			throw <RefreshCatch>{
				log: ( <Error>error ).stack,
				msg: "genshin.yml 重新加载失败，请前往控制台查看日志"
			};
		}
	}
}