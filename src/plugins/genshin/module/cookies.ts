import bot from "ROOT";
import { RefreshCatch } from "@modules/management/refresh";

export class Cookies {
	private index: number;
	private cookies: string[];
	private length: number;
	
	constructor() {
		this.cookies = bot.file.loadYAML( "cookies" ).cookies;
		this.index = 0;
		this.length = this.cookies.length;
	}
	
	public increaseIndex(): void {
		this.index = this.index === this.length - 1 ? 0 : this.index + 1;
	}
	
	public get(): string {
		return this.cookies[this.index];
	}
	
	public async refresh(): Promise<string> {
		try {
			this.cookies = bot.file.loadYAML( "cookies" ).cookies;
			this.index = 0;
			this.length = this.cookies.length;
			return "cookies 重新加载完毕";
		} catch ( error ) {
			throw <RefreshCatch>{
				log: ( <Error>error ).stack,
				msg: "cookies 重新加载失败，请前往控制台查看日志"
			};
		}
	}
}