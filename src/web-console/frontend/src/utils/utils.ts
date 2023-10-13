/**
 * 将 `xx.xx` 格式的路径拆分为 [xx, xx] 数组
 * @param path `xx.xx` 格式的路径字符串
 * @param ignore 无视倒数后几个 `.`
 * @return {string[]} 拆分后的路径数组
 */
function getPathList( path: string, ignore?: number ): string[] {
	let pathList = path.split( "." );
	if ( ignore ) {
		const firstItem = pathList.splice( 0, ignore + 1 ).join( "." );
		return [ firstItem, ...pathList ];
	}
	return pathList;
}

/**
 * 获取 `xx.xx` 格式路径字符串对应的对象的值
 * @param target 目标对象
 * @param path `xx.xx` 格式的路径字符串
 * @param ignore 无视倒数后几个 `.`
 * @return {any} 目标路径的值
 */
export function objectGet( target: Record<string, any>, path: string, ignore?: number ): any {
	return getPathList( path, ignore ).reduce( ( o, k ) => ( o || {} )[k], target );
}

/**
 * 设置对象中 `xx.xx` 格式路径的属性值
 * @param target 目标对象
 * @param path `xx.xx` 格式的路径字符串
 * @param value 要设置的值
 * @param ignore 无视倒数后几个 `.`
 */
export function objectSet( target: Record<string, any>, path: string, value: any, ignore?: number ): void {
	getPathList( path, ignore ).reduce( ( o, k, i, arr ) => {
		if ( i === arr.length - 1 ) {
			o[k] = value;
		} else {
			o[k] = {};
			return o[k];
		}
	}, target );
}