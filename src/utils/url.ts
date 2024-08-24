/* url 解析相关方法 */

/**
 * @desc 解析 url 参数为一个对象
 * @param url 目标 url
 * @return 参数对象
 */
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

/**
 * @desc 将 url 与参数对象解析为合法 url 字符串
 * @param url 目标 url
 * @param params 参数对象
 * @return 字符串
 */
export function urlParamsParse( url: string | undefined, params: Record<string, string | number> ): string {
	const paramsStr = Object.entries( params ).map( ( [ key, value ] ) => {
		return `${ key }=${ encodeURIComponent( value ) }`;
	} ).join( "&" );
	
	return url ? `${ url }?${ paramsStr }` : paramsStr;
}

export function parseURL( url: string ): URL {
	// 为没有协议的URL添加默认的协议头
	if ( !url.startsWith( 'http://' ) && !url.startsWith( 'https://' ) ) {
		url = 'http://' + url;
	}
	
	return new URL( url );
}