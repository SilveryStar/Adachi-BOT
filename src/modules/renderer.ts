import { URL, URLSearchParams } from "url";
import { ImageElem, segment, Sendable } from "icqq";
import { RefreshCatch } from "./management/refresh";
import * as puppeteer from "puppeteer";
import bot from "ROOT";

interface RenderSuccess {
	code: "ok";
	data: Sendable;
}

interface RenderError {
	code: "error";
	error: string;
}

export interface PageFunction {
	( page: puppeteer.Page ): Promise<Buffer | string | void>
}

export type RenderResult = RenderSuccess | RenderError;

export interface ScreenshotRendererMethods {
	asBase64( route: string, params?: Record<string, any>, viewPort?: puppeteer.Viewport | null, selector?: string ): Promise<RenderResult>;
	asSegment( route: string, params?: Record<string, any>, viewPort?: puppeteer.Viewport | null, selector?: string ): Promise<RenderResult>;
	asForFunction( route: string, pageFunction: PageFunction, viewPort?: puppeteer.Viewport | null, params?: Record<string, any> ): Promise<RenderResult>;
}

export interface RenderMethods {
	register( route: string, defaultSelector: string ): Renderer;
	/* 浏览器相关 */
	closeBrowser(): Promise<void>;
	launchBrowser(): Promise<puppeteer.Browser>;
	restartBrowser(): Promise<void>;
	refresh(): Promise<string>;
	/* 截图 */
	screenshot( url: string, viewPort: puppeteer.Viewport | null, selector: string ): Promise<string>;
	screenshotForFunction( url: string, viewPort: puppeteer.Viewport | null, pageFunction: PageFunction ): Promise<string>
}

export class Renderer implements ScreenshotRendererMethods {
	private readonly httpBase: string;
	
	constructor(
		private readonly defaultSelector: string,
		route: string
	) {
		this.httpBase = `http://localhost:${ bot.config.renderPort }${ route }`;
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
			console.log(url)
			const base64: string = await bot.renderer.screenshot( url, viewPort, selector );
			return { code: "ok", data: base64 };
		} catch ( error ) {
			const err = <string>( <Error>error ).stack;
			return { code: "error", error: err };
		}
	}
	
	public async asSegment(
		route: string,
		params: Record<string, any> = {},
		viewPort: puppeteer.Viewport | null = null,
		selector: string = this.defaultSelector
	): Promise<RenderResult> {
		try {
			const url: string = this.getURL( route, params );
			console.log( url )
			const base64: string = await bot.renderer.screenshot( url, viewPort, selector );
			const segmentImg: ImageElem = segment.image( base64 );
			return { code: "ok", data: segmentImg };
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

export class BasicRenderer implements RenderMethods {
	private browser?: puppeteer.Browser;
	private screenshotCount: number = 0;
	
	static screenshotLimit = <const>233;
	
	constructor() {
		this.launchBrowser()
			.then( browser => this.browser = browser );
	}
	
	public register( route: string, defaultSelector: string ): Renderer {
		return new Renderer( defaultSelector, route );
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
					headless: false,
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
		await page.content();
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
			await page.goto( url, {
				waitUntil: "networkidle0",
				timeout: 30000
			} );
			await this.pageLoaded( page );
			
			const option: puppeteer.ScreenshotOptions = { encoding: "base64", type: "jpeg", quality: 100 };;
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
			await page.goto( url, {
				waitUntil: "networkidle0",
				timeout: 30000
			} );
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