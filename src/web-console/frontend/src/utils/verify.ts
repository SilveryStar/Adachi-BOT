/**
 * @desc 校验传入值是否为 Json 字符串
 * @param str 待校验字符串
 * @return 判断结果
 */
export function isJsonString( str: unknown ): str is string {
	if ( typeof str !== "string" ) return false;
	try {
		const obj = JSON.parse( str );
		return !!( typeof obj === "object" && obj );
	} catch {
		return false;
	}
}

export function isValidUrl( url: string ): boolean {
	try {
		new URL( url );
		return true;
	} catch {
		return false;
	}
}