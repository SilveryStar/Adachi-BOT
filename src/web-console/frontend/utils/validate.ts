/* 判断字符串是否是json字符串 */
export function isJsonString( str: any ): str is string {
	if ( typeof str !== "string" ) return false;
	try {
		const obj = JSON.parse( str );
		return typeof obj === "object";
	} catch ( e ) {
		return false;
	}
}