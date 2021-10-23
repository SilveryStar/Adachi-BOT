import puppeteer from "puppeteer";
import { URL, URLSearchParams } from "url";
import { config } from "../init";

let browser: puppeteer.Browser;

async function createBrowser(): Promise<void> {
	browser = await puppeteer.launch( {
		headless: true,
		defaultViewport: {
			width: 1620,
			height: 1132
		},
		args: [
			"--no-sandbox",
			"--disable-setuid-sandbox",
			"--disable-dev-shm-usage"
		]
	} );
}

function getURL( target: string, params?: any ): string {
	const paramStr: string = new URLSearchParams( params ).toString();
	
	try {
		new URL( target );
		return target + "?" + paramStr;
	} catch ( e ) {
		const url: string = `http://localhost:${ config.serverPort }/views/${ target }.html`;
		return url + "?" + paramStr;
	}
}

async function render(
	target: string,
	params: any = {},
	selector: string = "#app",
	cqCode: boolean = true
): Promise<string> {
	const url: string = getURL( target, params );
	
	const page: puppeteer.Page = await browser.newPage();
	await page.goto( url );
	const htmlElement = await page.$( selector );
	const result = await htmlElement?.screenshot( {
		encoding: "base64"
	} ) as string;
	const base64: string = "base64://" + result;
	
	await page.close();
	if ( cqCode ) {
		return `[CQ:image,file=${ base64 }]`;
	}
	return base64;
}

export {
	createBrowser,
	render
}