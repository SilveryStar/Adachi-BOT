import { URL, URLSearchParams } from "url";
import { segment, Sendable } from "@/modules/lib";
import { RefreshCatch } from "./management/refresh";
import * as puppeteer from "puppeteer";
import bot from "ROOT";
import process from "process";
import { BotConfig } from "@/modules/config";

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
	launchBrowser(): Promise<puppeteer.Browser | null>;
	restartBrowser(): Promise<puppeteer.Browser | null>;
	refresh(): Promise<string>;
	/* 截图 */
	screenshot( url: string, viewPort: puppeteer.Viewport | null, selector: string, encoding: 'base64' | 'binary' ): Promise<Buffer | string | void>;
	screenshotForFunction( url: string, viewPort: puppeteer.Viewport | null, pageFunction: PageFunction ): Promise<Buffer | string | void>
}

export class Renderer implements ScreenshotRendererMethods {
	constructor(
		private readonly defaultSelector: string,
		private readonly route: string
	) {
	}
	
	private getBaseHttp() {
		return `http://localhost:${ bot.config.base.renderPort }${ this.route }`;
	}
	
	public async asBase64(
		route: string,
		params: Record<string, any> = {},
		viewPort: puppeteer.Viewport | null = null,
		selector: string = this.defaultSelector
	): Promise<RenderResult> {
		try {
			const url: string = this.getURL( route, params );
			const data: Buffer | string | void = await bot.renderer.screenshot( url, viewPort, selector, 'base64' );
			return { code: "ok", data: data ? `base64://${ <string>data }` : "" };
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
			const data: Buffer | string | void = await bot.renderer.screenshot( url, viewPort, selector, 'binary' );
			if ( !data ) {
				return { code: "ok", data: "" };
			}
			if ( typeof data === 'string' ) {
				return { code: "ok", data: segment.image( `base64://${ data }` ) };
			}
			return { code: "ok", data: segment.image( data ) };
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
			const data: Buffer | string | void = await bot.renderer.screenshotForFunction( url, viewPort, pageFunction );
			return { code: "ok", data: data ? segment.image( data ) : "" };
		} catch ( error ) {
			const err = <string>( <Error>error ).stack;
			return { code: "error", error: err };
		}
	}
	
	private getURL( route: string, params?: Record<string, any> ): string {
		const paramStr: string = new URLSearchParams( params ).toString();
		
		try {
			new URL( route );
			return `${ route }?${ paramStr }`;
		} catch ( e ) {
			const url: string = this.getBaseHttp() + route;
			return `${ url }?${ paramStr }`;
		}
	}
}

export class BasicRenderer implements RenderMethods {
	private browser?: puppeteer.Browser;
	private screenshotCount: number = 0;
	
	static screenshotLimit = <const>233;
	
	constructor(
		private config: BotConfig["directive"]
	) {
		this.launchBrowser().then( browser => {
			browser && ( this.browser = browser );
		} );
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
	
	public async launchBrowser(): Promise<puppeteer.Browser | null> {
		if ( this.browser ) {
			return this.browser;
		}
		try {
			const browser = await puppeteer.launch( {
				headless: "new",
				args: [
					"--no-sandbox",
					"--disable-setuid-sandbox",
					"--disable-dev-shm-usage"
				],
				defaultViewport: {
					width: 800,
					height: 600,
					deviceScaleFactor: this.config.imageQuality
				}
			} );
			bot.logger.info( "浏览器启动成功" );
			return browser;
		} catch ( error ) {
			await bot.message.sendMaster( `浏览器启动失败: ${ ( <Error>error ).message }` );
			bot.logger.error( `浏览器启动失败: ${ ( <Error>error ).stack }` );
			return null;
		}
	}
	
	public async restartBrowser(): Promise<puppeteer.Browser | null> {
		await this.closeBrowser();
		const browser = await this.launchBrowser();
		if ( browser ) {
			this.browser = browser;
			this.screenshotCount = 0;
			return this.browser;
		}
		return null;
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
	
	public async screenshot( url: string, viewPort: puppeteer.Viewport | null, selector: string, encoding: 'base64' | 'binary' ): Promise<Buffer | string | void> {
		if ( !this.browser ) {
			throw new Error( "浏览器未启动" );
		}
		const page: puppeteer.Page = await this.browser.newPage();
		try {
			if ( process.env.NODE_ENV !== "production" ) {
				bot.logger.info( `图片预览地址: ${ url }` );
			}
			// 设置设备参数
			if ( viewPort ) {
				// 若开发者指定了缩放比例，则将开发者指定的缩放比例乘以用户方所配置的缩放比例，考虑到设备承受能力问题，结果最大不能超过 5
				const factor = ( viewPort.deviceScaleFactor || 1 ) * this.config.imageQuality;
				await page.setViewport( {
					...viewPort,
					deviceScaleFactor: factor > 5 ? 5 : factor
				} );
			}
			await page.goto( url, {
				waitUntil: "networkidle0",
				timeout: 30000
			} );
			await this.pageLoaded( page );
			
			const option: puppeteer.ScreenshotOptions = { encoding, type: 'jpeg', quality: 100 };
			const element = await page.$( selector );
			
			if ( !element ) {
				throw new Error( "未找到目标元素" );
			}
			
			const result = await element?.screenshot( option );
			
			this.screenshotCount++;
			if ( this.screenshotCount >= BasicRenderer.screenshotLimit ) {
				await bot.renderer.restartBrowser();
			}
			
			return result;
		} finally {
			await page.close();
		}
	}
	
	public async screenshotForFunction( url: string, viewPort: puppeteer.Viewport | null, pageFunction: PageFunction ): Promise<Buffer | string | void> {
		if ( !this.browser ) {
			throw new Error( "浏览器未启动" );
		}
		const page: puppeteer.Page = await this.browser.newPage();
		try {
			if ( process.env.NODE_ENV !== "production" ) {
				bot.logger.info( `图片预览地址: ${ url }` );
			}
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
			
			this.screenshotCount++;
			if ( this.screenshotCount >= BasicRenderer.screenshotLimit ) {
				await bot.renderer.restartBrowser();
			}
			
			if ( result && typeof result === 'string' ) {
				// 兼容低版本插件的返回
				return result.startsWith( "base64://" ) ? result : `base64://${ result }`;
			}
			
			return result;
		} finally {
			await page.close();
		}
	}
}