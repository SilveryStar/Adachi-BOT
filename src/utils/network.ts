/* 网络相关通用方法 */
import { networkInterfaces } from "os";
import { Logger } from "log4js";
import { createServer } from "net";

/** 获取当前环境 ip 地址 */
export function getIPAddress() {
	const interfaces = networkInterfaces();
	for ( const iFaceKey in interfaces ) {
		const iFace = interfaces[iFaceKey];
		if ( !iFace ) {
			continue;
		}
		const targetAlias = iFace.find( alias => {
			return alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal;
		} );
		if ( targetAlias ) {
			console.log( targetAlias )
			return targetAlias.address;
		}
	}
	return "127.0.0.1";
}

/**
 * 查找一个可用端口
 * @param port 未指定默认从1024开始查找
 * @param logger
 */
export async function findFreePort( port = 1024, logger?: Logger ) {
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