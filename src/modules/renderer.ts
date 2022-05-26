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

export interface PageFunction {
	( page: puppeteer.Page ): Promise<Buffer | string | void>
}

export type RenderResult = RenderSuccess | RenderError;

export class Renderer {
	private readonly httpBase: string;
	
	constructor(
		private readonly sourceName: string,
		private readonly defaultSelector: string,
		route: string, port: number
	) {
		this.httpBase = `http://localhost:${ port }${ route }`;
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
	
	public async asBase64(
		route: string,
		params: Record<string, any> = {},
		viewPort: puppeteer.Viewport | null = null,
		selector: string = this.defaultSelector
	): Promise<RenderResult> {
		try {
			const url: string = this.getURL( route, params );
			const base64: string = await bot.renderer.screenshot( url, viewPort, selector );
			return { code: "ok", data: base64 };
		} catch ( error ) {
			const err = <string>( <Error>error ).stack;
			return { code: "error", error: err };
		}
	}
	
	public async asCqCode(
		route: string,
		params: Record<string, any> = {},
		viewPort: puppeteer.Viewport | null = null,
		selector: string = this.defaultSelector
	): Promise<RenderResult> {
		try {
			const url: string = this.getURL( route, params );
			const base64: string = await bot.renderer.screenshot( url, viewPort, selector );
			const cqCode: string = `[CQ:image,file=${ base64 }]`;
			return { code: "ok", data: cqCode };
		} catch ( error ) {
			const err = <string>( <Error>error ).stack;
			return { code: "error", error: err };
		}
	}
	
	public async asForFunction(
		route: string,
		pageFunction: PageFunction,
		viewPort: puppeteer.Viewport | null = null,
		params: Record<string, any> = {}
	): Promise<RenderResult> {
		try {
			const url: string = this.getURL( route, params );
			const data: string = await bot.renderer.screenshotForFunction( url, viewPort, pageFunction );
			return { code: "ok", data };
		} catch ( error ) {
			const err = <string>( <Error>error ).stack;
			return { code: "error", error: err };
		}
	}
}

export class BasicRenderer {
	private browser?: puppeteer.Browser;
	private screenshotCount: number = 0;
	
	static screenshotLimit = <const>233;
	
	constructor() {
		this.launchBrowser()
			.then( browser => this.browser = browser );
	}
	
	public register(
		name: string, route: string,
		port: number, defaultSelector: string
	): Renderer {
		return new Renderer( name, defaultSelector, route, port );
	}
	
	public async closeBrowser(): Promise<void> {
		if ( !this.browser ) {
			return;
		}
		const pages = await this.browser.pages();
		await Promise.all( pages.map( page => page.close() ) );
		await this.browser.close();
		this.browser = undefined;
	}
	
	public async launchBrowser(): Promise<puppeteer.Browser> {
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
	
	public async restartBrowser(): Promise<void> {
		await this.closeBrowser();
		this.browser = await this.launchBrowser();
		this.screenshotCount = 0;
	}
	
	public async refresh(): Promise<string> {
		try {
			await this.restartBrowser();
			return `浏览器重启完成`;
		} catch ( error ) {
			throw <RefreshCatch>{
				log: ( <Error>error ).stack,
				msg: `浏览器重启失败，请前往控制台查看日志`
			};
		}
	}
	
	private async pageLoaded( page: puppeteer.Page ) {
		await page.waitForFunction( () => {
			return document.readyState === "complete";
		}, { timeout: 10000 } )
	}
	
	public async screenshot( url: string, viewPort: puppeteer.Viewport | null, selector: string ): Promise<string> {
		if ( !this.browser ) {
			throw new Error( "浏览器未启动" );
		}
		const page: puppeteer.Page = await this.browser.newPage();
		try {
			// 设置设备参数
			if ( viewPort ) {
				await page.setViewport( viewPort );
			}
			await page.goto( url );
			await this.pageLoaded( page );
			
			const option: puppeteer.ScreenshotOptions = { encoding: "base64" };
			const element = await page.$( selector );
			const result = <string>await element?.screenshot( option );
			const base64: string = `base64://${ result }`;
			await page.close();
			
			this.screenshotCount++;
			if ( this.screenshotCount >= BasicRenderer.screenshotLimit ) {
				await bot.renderer.restartBrowser();
			}
			
			return base64;
		} catch ( err: any ) {
			await page.close();
			throw err;
		}
	}
	
	public async screenshotForFunction( url: string, viewPort: puppeteer.Viewport | null, pageFunction: PageFunction ): Promise<string> {
		if ( !this.browser ) {
			throw new Error( "浏览器未启动" );
		}
		const page: puppeteer.Page = await this.browser.newPage();
		try {
			// 设置设备参数
			if ( viewPort ) {
				await page.setViewport( viewPort );
			}
			await page.goto( url );
			await this.pageLoaded( page );
			
			const result = await pageFunction( page );
			await page.close();
			
			this.screenshotCount++;
			if ( this.screenshotCount >= BasicRenderer.screenshotLimit ) {
				await bot.renderer.restartBrowser();
			}
			
			return result === undefined ? "" : result.toString();
		} catch ( err: any ) {
			await page.close();
			throw err;
		}
	}
}