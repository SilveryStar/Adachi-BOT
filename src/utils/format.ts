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