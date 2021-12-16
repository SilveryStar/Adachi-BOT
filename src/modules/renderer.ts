import { URL, URLSearchParams } from "url";
import { RefreshCatch } from "@modules/management/refresh";
import puppeteer from "puppeteer";
import bot from "ROOT";

interface RenderSuccess {
	code: "ok";
	data: string;
}

interface RenderError {
	code: "error";
	error: string;
}

export type RenderResult = RenderSuccess | RenderError;

export default class Renderer {
	private browser?: puppeteer.Browser;
	private screenshotCount: number;
	
	private readonly sourceName: string;
	private readonly defaultSelector: string;
	private readonly httpBase: string;
	
	static screenshotLimit = <const>233;
	
	constructor(
		name: string, route: string,
		port: number, defaultSelector: string
	) {
		this.screenshotCount = 0;
		this.defaultSelector = defaultSelector;
		this.sourceName = name;
		this.httpBase = `http://localhost:${ port }${ route }`;
		
		this.launchBrowser()
			.then( browser => this.browser = browser );
	}
	
	private async closeBrowser(): Promise<void> {
		if ( !this.browser ) {
			return;
		}
		await this.browser.close();
		this.browser = undefined;
	}
	
	private async launchBrowser(): Promise<puppeteer.Browser> {
		return new Promise( async ( resolve, reject ) => {
			if ( this.browser ) {
				reject( "浏览器已经启动" );
			}
			try {
				const browser = await puppeteer.launch( {
					headless: true,
					args: [
						"--no-sandbox",
						"--disable-setuid-sandbox",
						"--disable-dev-shm-usage"
					]
				} );
				bot.logger.info( "浏览器启动成功" );
				resolve( browser );
			} catch ( error ) {
				const err: string = `浏览器启动失败: ${ ( <Error>error ).stack }`;
				await bot.message.sendMaster( err );
				bot.logger.error( err );
			}
		} );
	}
	
	private async restartBrowser(): Promise<void> {
		await this.closeBrowser();
		await this.launchBrowser();
		this.screenshotCount = 0;
	}
	
	private getURL( route: string, params?: Record<string, any> ): string {
		const paramStr: string = new URLSearchParams( params ).toString();
		
		try {
			new URL( route );
			return `${ route }?${ paramStr }`;
		} catch ( e ) {
			const url: string = this.httpBase + route;
			return `${ url }?${ paramStr }`;
		}
	}
	
	private async render(
		route: string,
		params: Record<string, any>,
		selector: string
	): Promise<string> {
		if ( !this.browser ) {
			throw new Error( "浏览器未启动" );
		}
		const url: string = this.getURL( route, params );
		const page: puppeteer.Page = await this.browser.newPage();
		await page.goto( url );
		
		const option = { encoding: "base64" };
		const element = await page.$( selector );
		const result = <string>await element?.screenshot( option );
		const base64: string = `base64://${ result }`;
		
		this.screenshotCount++;
		if ( this.screenshotCount >= Renderer.screenshotLimit ) {
			await this.restartBrowser();
		}
		
		return base64;
	}
	
	public async refresh(): Promise<string> {
		try {
			await this.restartBrowser();
			return `浏览器 ${ this.sourceName } 重启完成`;
		} catch ( error ) {
			throw <RefreshCatch>{
				log: ( <Error>error ).stack,
				msg: `浏览器 ${ this.sourceName } 重启完成失败，请前往控制台查看日志`
			};
		}
	}
	
	public async asBase64(
		route: string,
		params: Record<string, any> = {},
		selector: string = this.defaultSelector
	): Promise<RenderResult> {
		try {
			const base64: string = await this.render( route, params, selector );
			return { code: "ok", data: base64 };
		} catch ( error ) {
			const err = <string>error.stack;
			return { code: "error", error: err };
		}
	}
	
	public async asCqCode(
		route: string,
		params: Record<string, any> = {},
		selector: string = this.defaultSelector
	): Promise<RenderResult> {
		try {
			const base64: string = await this.render( route, params, selector );
			const cqCode: string = `[CQ:image,file=${ base64 }]`;
			return { code: "ok", data: cqCode };
		} catch ( error ) {
			const err = <string>error.stack;
			return { code: "error", error: err };
		}
	}
}