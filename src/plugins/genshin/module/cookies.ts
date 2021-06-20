import { loadYAML } from "../../../utils/config";

class Cookies {
	private index: number;
	private readonly cookies: string[];
	private readonly length: number;
	
	constructor() {
		this.cookies = loadYAML( "cookies" ).cookies;
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

export { Cookies }