/* 格式化相关方法 */

/**
 * 格式化内存显示值
 * @param memories
 * @param type
 */
export function formatMemories( memories: number, type: "G" | "M" | "KB" | "B" ) {
	const sizeMap: Record<typeof type, number> = {
		G: 1 << 30,
		M: 1 << 20,
		KB: 1 << 10,
		B: 1
	}
	return ( memories / sizeMap[type] ).toFixed( 2 ) + type;
}

/**
 * 格式化版本信息
 */
export function formatVersion( version: string ) {
	const [ ver = "", fixed = "" ] = version.split( "-" );
	const [ major = "", minor = "", patch = "" ] = ver.split( "." );
	return {
		major: Number.parseInt( major ),
		minor: Number.parseInt( minor ),
		patch: Number.parseInt( patch ),
		fixed
	};
}