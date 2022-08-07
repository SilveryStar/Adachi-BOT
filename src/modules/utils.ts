import { createServer } from "net";
import { Logger } from "log4js";

/**
 * 查找一个可用端口
 * @param port 未指定默认从1024开始查找
 * @param logger
 */
export const findFreePort: ( port?: number, logger?: Logger ) => Promise<number> = async ( port = 1024, logger ) => {
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

export function randomSecret( length: number ): string {
	const charSet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ,.;></~?[]{}~!@#$%^&*()-=+1234567890";
	const characterLen: number = charSet.length;
	let result: string = "";
	
	for ( let i = 0; i < length; i++ ) {
		const randNum: number = Math.floor( Math.random() * characterLen );
		result += charSet.charAt( randNum );
	}
	
	return result;
}