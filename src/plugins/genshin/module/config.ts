import { RefreshCatch } from "@/modules/management/refresh";
import { getRandomString } from "@/utils/common";

export default class GenshinConfig {
	public cardWeaponStyle: "normal" | "weaponA" | "weaponB";
	public cardProfile: "user" | "random";
	public showCharScore: boolean | number[];
	public wishLimitNum: number;
	public verifyEnable: boolean;
	public verifyRepeat: number;
	public verifyToken: string;
	
	public static init = {
		cardWeaponStyle: "normal",
		cardProfile: "random",
		showCharScore: true,
		wishLimitNum: 99,
		verifyEnable: false,
		verifyRepeat: 1,
		verifyToken: getRandomString( 6 )
	};
	
	constructor( config: any ) {
		this.cardWeaponStyle = config.cardWeaponStyle;
		this.cardProfile = config.cardProfile;
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
			throw <RefreshCatch> {
				log: ( <Error>error ).stack,
				msg: "genshin.yml 重新加载失败，请前往控制台查看日志"
			};
		}
	}
}