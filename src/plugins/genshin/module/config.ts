import { RefreshCatch } from "@modules/management/refresh";
import bot from "ROOT";

export default class GenshinConfig {
	public cardWeaponStyle: "normal" | "weaponA" | "weaponB";
	public cardProfile: "user" | "random";
	public serverPort: number;
	
	public static init = {
		cardWeaponStyle: "normal",
		cardProfile: "random",
		serverPort: 58612
	};
	
	constructor( config: any ) {
		this.cardWeaponStyle = config.cardWeaponStyle;
		this.cardProfile = config.cardProfile;
		this.serverPort = config.serverPort;
	}
	
	public async refresh(): Promise<string> {
		try {
			const config: any = bot.file.loadYAML( "genshin" );
			this.cardWeaponStyle = config.cardWeaponStyle;
			this.cardProfile = config.cardProfile;
			return "genshin.yml 重新加载完毕";
		} catch ( error ) {
			throw <RefreshCatch> {
				log: ( <Error>error ).stack,
				msg: "genshin.yml 重新加载失败，请前往控制台查看日志"
			};
		}
	}
}