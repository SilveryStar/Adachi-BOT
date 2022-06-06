/* 获取内存格式化 */
export function formatMemories( memories: number, type: "G" | "M" | "KB" | "B" ) {
	const sizeMap: Record<typeof type, number> = {
		G: 1 << 30,
		M: 1 << 20,
		KB: 1 << 10,
		B: 1
	}
	return ( memories / sizeMap[type] ).toFixed( 2 ) + type;
}