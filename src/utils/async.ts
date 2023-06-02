/* 异步相关方法 */

/**
 * @desc 阻塞一段时间
 * @param time 阻塞时间（毫秒）
 */
export function sleep( time: number ): Promise<void> {
	return new Promise( resolve => {
		setTimeout( resolve, time );
	} );
}