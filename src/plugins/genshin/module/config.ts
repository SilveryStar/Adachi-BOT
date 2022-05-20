import { RefreshCatch } from "@modules/management/refresh";

export default class GenshinConfig {
	public cardWeaponStyle: "normal" | "weaponA" | "weaponB";
	public cardProfile: "user" | "random";
	public serverPort: number;
	public showCharScore: boolean | number[];
	public wishLimitNum: number;
	
	public static init = {
		cardWeaponStyle: "normal",
		cardProfile: "random",
		serverPort: 58612,
		showCharScore: true,
		wishLimitNum: 99
	};
	
	constructor( config: any ) {
		this.cardWeaponStyle = config.cardWeaponStyle;
		this.cardProfile = config.cardProfile;
		this.serverPort = config.serverPort;
		this.showCharScore = config.showCharScore;
		this.wishLimitNum = config.wishLimitNum;
	}
	
	public async refresh( config ): Promise<string> {
		try {
			this.cardWeaponStyle = config.cardWeaponStyle;
			this.cardProfile = config.cardProfile;
			this.showCharScore = config.showCharScore;
			this.wishLimitNum = config.wishLimitNum;
			return "genshin.yml 重新加载完毕";
		} catch ( error ) {
			throw <RefreshCatch> {
				log: ( <Error>error ).stack,
				msg: "genshin.yml 重新加载失败，请前往控制台查看日志"
			};
		}
	}
}