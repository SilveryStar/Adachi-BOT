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

export function waitWithTimeout( promise: Promise<any>, timeout: number ): Promise<any> {
	let timer: string | number | NodeJS.Timeout | undefined;
	const timeoutPromise = new Promise( ( _, reject ) => {
		timer = setTimeout( () => reject( `timeout: ${ timeout }ms` ), timeout );
	} );
	return Promise.race( [ timeoutPromise, promise ] )
		.finally( () => clearTimeout( timer ) );
}