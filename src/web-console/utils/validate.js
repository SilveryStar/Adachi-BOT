/* 判断字符串是否是json字符串 */
export function isJsonString( str ) {
	if ( typeof str !== "string" ) return false;
	try {
		const obj = JSON.parse( str );
		return typeof obj === "object";
	} catch ( e ) {
		return false;
	}
}