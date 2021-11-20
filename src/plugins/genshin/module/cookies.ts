import bot from "ROOT";

export class Cookies {
	private index: number;
	private readonly cookies: string[];
	private readonly length: number;
	
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
}