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

/* render 渲染图片参数类型 */
export interface RenderOptions {
	/** URL 查询参数（将会作为查询参数拼到url上一起访问）*/
	query?: Record<string, string | number | boolean | null | undefined>;
	/** 页面初始渲染数据，会注入到 window.__RENDER_DATA__ */
	data?: unknown;
	/** 截图相关配置 */
	screenshot?: {
		type?: "base64" | "segment";
		selector?: string;
		quality?: number;
	};
	/** 视口配置 */
	viewport?: puppeteer.Viewport | null;
	/** 渲染行为控制 */
	options?: {
		waitUntil?: "load" | "networkidle";
		timeout?: number;
	};
}

/* 截图任务所需参数类型 - 通常仅 screenshotWithPayload 使用 */
export interface RenderTask {
	/** 最终 URL */
	url: string;
	/** 注入 window 的数据 */
	data?: unknown;
	/** 截图配置 */
	screenshot: {
		selector: string;
		encoding: "binary" | "base64";
		quality: number;
	};
	viewport?: puppeteer.Viewport | null;
	options?: {
		waitUntil: "load" | "networkidle";
		timeout: number;
	};
}



export interface ScreenshotRendererMethods {
	asBase64( route: string, params?: Record<string, any>, viewPort?: puppeteer.Viewport | null, selector?: string ): Promise<RenderResult>;
	asSegment( route: string, params?: Record<string, any>, viewPort?: puppeteer.Viewport | null, selector?: string ): Promise<RenderResult>;
	asForFunction( route: string, pageFunction: PageFunction, viewPort?: puppeteer.Viewport | null, params?: Record<string, any> ): Promise<RenderResult>;
	/** 新增截图逻辑 */
	render( route: string, options?: RenderOptions ): Promise<RenderResult>;
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
	screenshotForFunction( url: string, viewPort: puppeteer.Viewport | null, pageFunction: PageFunction ): Promise<Buffer | string | void>;
	/** 新增截图逻辑 */
	screenshotWithTask( payload: RenderTask ): Promise<Buffer | string | void>;
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
	
	/**
	 * @deprecated 请使用 render 方法代替
	 */
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
	
	/**
	 * @deprecated 请使用 render 方法代替
	 */
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
	
	/** 新增截图逻辑 */
	public async render(
		route: string,
		options: RenderOptions = {}
	): Promise<RenderResult> {
		try {
			// 若存在 query 参数，则拼接 url
			const url = this.getURL( route, options.query ?? {} );
			
			// 调用新增的截图逻辑获取对应不同 encoding 的数据内容
			const result = await bot.renderer.screenshotWithTask( {
				url,
				data: options.data,
				viewport: options.viewport ?? null,
				options: {
					waitUntil: options.options?.waitUntil ?? "networkidle",
					timeout: options.options?.timeout ?? 30000
				},
				screenshot: {
					selector: options.screenshot?.selector ?? this.defaultSelector,
					encoding:
						options.screenshot?.type === "base64" ? "base64" : "binary",
					quality: options.screenshot?.quality ?? 100
				}
			} );
			if ( !result ) return { code: "ok", data: "" };
			
			// 根据不同 encoding 进行包装返回
			const type = options.screenshot?.type ?? "segment";
			
			if ( type === "segment" ) {
				if ( typeof result === "string" ) {
					return { code: "ok", data: segment.image( `base64://${ result }` ) };
				}
				return { code: "ok", data: segment.image( result as Buffer ) };
			}
			
			// 此时 type 为 base64
			return { code: "ok", data: `base64://${ result as string }` };
		} catch ( error ) {
			const err = ( error as Error ).stack ?? String( error );
			return { code: "error", error: err };
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
	
	// 若开发者指定了缩放比例，则将开发者指定的缩放比例乘以用户方所配置的缩放比例，考虑到设备承受能力问题，结果最大不能超过 5
	private getViewport( viewPort: puppeteer.Viewport ): puppeteer.Viewport {
		const factor = ( viewPort.deviceScaleFactor || 1 ) * this.config.imageQuality;
		return {
			...viewPort,
			deviceScaleFactor: factor > 5 ? 5 : factor
		}
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
				await page.setViewport( this.getViewport( viewPort ) );
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
				await page.setViewport( this.getViewport( viewPort ) );
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
	
	/** 新增截图逻辑 */
	// 向 window 注入数据
	private async injectWindowData( page: puppeteer.Page, data: unknown ) {
		if ( data === undefined ) return;
		
		// 在 任何页面脚本执行之前 注入
		await page.evaluateOnNewDocument( d => {
			Object.defineProperty( window, "__RENDER_DATA__", {
				value: d,
				writable: false,
				configurable: false
			} );
		}, data );
	}
	
	public async screenshotWithTask( task: RenderTask ): Promise<Buffer | string | void> {
		if ( !this.browser ) {
			throw new Error( "浏览器未启动" );
		}
		
		const page: puppeteer.Page = await this.browser.newPage();
		try {
			const url = task.url;
			
			if ( process.env.NODE_ENV !== "production" ) {
				bot.logger.info( `图片预览地址: ${ url }` );
			}
			
			// 设置设备参数
			if ( task.viewport ) {
				await page.setViewport( this.getViewport( task.viewport ) );
			}
			
			// 在跳转目标页面前，注册注入数据相关逻辑
			if ( task.data !== undefined ) {
				await this.injectWindowData( page, task.data );
			}
			
			await page.goto( url, {
				waitUntil: task.options?.waitUntil === "load" ? "load" : "networkidle0",
				timeout: task.options?.timeout ?? 30000
			} );
			
			await this.pageLoaded( page );
			
			const selector = task.screenshot?.selector ?? "#app";
			// 编码为了方便调用，支持 segment，但最终这里需要转换为 base64 或 binary
			const encoding: "base64" | "binary" =
				task.screenshot?.encoding === "base64" ? "base64" : "binary";
			
			const option: puppeteer.ScreenshotOptions = {
				encoding,
				type: "jpeg",
				quality: task.screenshot?.quality ?? 100
			};
			
			const element = await page.$( selector );
			if ( !element ) {
				throw new Error( "未找到目标元素" );
			}
			
			const result = await element.screenshot( option );
			
			// 每次截图计数，到上限重启
			this.screenshotCount++;
			if ( this.screenshotCount >= BasicRenderer.screenshotLimit ) {
				await bot.renderer.restartBrowser();
			}
			
			return result;
		} finally {
			await page.close();
		}
	}
	
	
}