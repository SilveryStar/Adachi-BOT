import { Logger } from "log4js";

/**
 * 查找一个可用端口
 * @param port 未指定默认从1024开始查找
 * @param logger
 */
export const findFreePort: ( port?: number, logger?: Logger ) => Promise<number> = async ( port = 1024, logger ) => {
	const { createServer } = await import( "net" );
	if ( port > 65535 ) {
		// 如果端口号大于65535要重新从1024开始查找(0~1023都是保留端口)
		port = 1024;
	}
	
	function find( port: number ): Promise<number | Error> {
		return new Promise( ( resolve, reject ) => {
			let server = createServer().listen( port );
			server.on( 'listening', () => {
				server.close();
				resolve( port );
			} );
			server.on( 'error', ( err: any ) => {
				if ( err.code == 'EADDRINUSE' ) {
					const message = `端口[${ port }]已被占用，正在为你寻找下一个可用端口...`;
					if ( !logger ) {
						console.debug( message );
					} else {
						logger.debug( message );
					}
					resolve( err );
				} else {
					reject( err );
				}
			} );
		} );
	}
	
	let result = await find( port );
	if ( result instanceof Error ) {
		port++;
		return await findFreePort( port );
	} else {
		return port;
	}
}

// 解析 url 参数对象
export function urlParamsGet( url: string ): Record<string, string> {
	try {
		const searchParams = [ ...new URL( url ).searchParams ].map( ( [ key, value ] ) => {
			return [ key, decodeURIComponent( value ) ];
		} )
		return Object.fromEntries( searchParams );
	} catch {
		return {};
	}
}

/* 解析参数为 url 字符串 */
export function urlParamsParse( url: string | undefined, params: Record<string, string | number> ): string {
	const paramsStr = Object.entries( params ).map( ( [ key, value ] ) => {
		return `${ key }=${ encodeURIComponent( value ) }`;
	} ).join( "&" );
	
	return url ? `${ url }?${ paramsStr }` : paramsStr;
}

/* 校验传入值是否为 Json 字符串 */
export function isJsonString( str: unknown ): str is string {
	if ( typeof str !== "string" ) return false;
	try {
		const obj = JSON.parse( str );
		return !!( typeof obj === "object" && obj );
	} catch {
		return false;
	}
}

/* 阻塞延时 */
export function sleep( time: number ): Promise<void> {
	return new Promise( resolve => {
		setTimeout( resolve, time );
	} );
}

// 随机延时阻塞
export async function randomSleep( min: number, max: number, second: boolean = false ): Promise<void> {
	if ( second ) {
		min = min * 1000;
		max = max * 1000;
	}
	const randomTime = getRandomNumber( min, max );
	await sleep( randomTime );
}

/* 获取区间内随机值 */
export function getRandomNumber( min: number, max: number ) {
	const range: number = Math.floor( max ) - Math.ceil( min ) + 1;
	return min + Math.floor( Math.random() * range );
}

/* 获取指定长度的随机字符串 */
export function getRandomString( length: number ) {
	const charSet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ,.;></~?[]{}~!@#$%^&*()-=+1234567890";
	return Array.from( { length }, () => {
		const randNum = Math.floor( Math.random() * charSet.length );
		return charSet[randNum];
	} ).join( "" );
}

/* 获取配置项值，值为 boolean 则取默认值，反之正常取值 */
export function getConfigValue<T extends Record<any, any>, K extends keyof T, V>( data: boolean | string | T, key: K, defaultValue: V ) {
	if ( typeof data === "string" || typeof data === "boolean") {
		return defaultValue;
	} else {
		return data[key] || defaultValue;
	}
}