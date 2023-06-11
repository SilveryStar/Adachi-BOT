import { RefreshCatch } from "@/modules/management/refresh";

export class Cookies {
	private index: number;
	private cookies: string[];
	private length: number;
	
	static checkExpired( cookie: string ): string {
		const reg: RegExp = /.*?ltuid=([0-9]+).*?/;
		const execRes: RegExpExecArray | null = reg.exec( cookie );
		return execRes
			? `米游社通行证 ID 为 ${ execRes[1] } 的 cookie 已失效，请及时更换`
			: "cookie 格式不正确";
	}
	
	constructor( cookies: string[] ) {
		this.cookies = cookies;
		this.index = 0;
		this.length = this.cookies.length;
	}
	
	public increaseIndex(): void {
		this.index = this.index === this.length - 1 ? 0 : this.index + 1;
	}
	
	public get(): string {
		return this.cookies[this.index];
	}
	
	public getIndex(): number {
		return this.index;
	}
}