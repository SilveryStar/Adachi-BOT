import puppeteer from "puppeteer";
import { config } from "../init";

let browser: puppeteer.Browser;

async function createBrowser(): Promise<void> {
	browser = await puppeteer.launch( {
		headless: true,
		args: [
			"--no-sandbox",
			"--disable-setuid-sandbox",
			"--disable-dev-shm-usage"
		]
	} );
}

function getURL( target: string, params?: any ): string {
	let url: string = `http://localhost:${ config.serverPort }/views/${ target }.html`;
	
	if ( params === undefined ) {
		return url;
	}
	
	let num: number = 0;
	for ( let key in params ) {
		if ( params.hasOwnProperty( key ) ) {
			url += `${ num++ === 0 ? "?" : "&" }${ key }=${ params[key] }`;
		}
	}
	
	return url;
}

async function render( target: string, params?: any ): Promise<string> {
	const url: string = getURL( target, params );

	const page: puppeteer.Page = await browser.newPage();
	await page.goto( url );
	const htmlElement = await page.$( "#app" );
	const base64 = await htmlElement?.screenshot( {
		encoding: "base64"
	} ) as string;
	
	await page.close();
	return `[CQ:image,file=base64://${ base64 }]`;
}

export {
	createBrowser,
	render
}