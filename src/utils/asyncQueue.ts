/**
 * @file 异步事件队列工具类
 * @author @MarryDream
 * @licence MIT
 * @copyright MarryDream 2023
 * @since 3.1.2
 */

export interface AsyncQueueItem<T = any> {
	asyncFunction: () => Promise<T>;
	retries: number;
	resolve: ( value: unknown ) => void;
	reject: ( reason?: any ) => void;
}


export default class AsyncQueue {
	private queue: AsyncQueueItem[] = [];
	private runningTasks: number = 0;
	constructor(
		private maxLength = 10,
		private retryLimit = 3 ) {
	}
	
	async enqueue<T>( asyncFunction: AsyncQueueItem<T>["asyncFunction"] ): Promise<T> {
		return new Promise( async ( resolve, reject ) => {
			const task = { asyncFunction, retries: 0, resolve, reject };
			
			this.queue.push( <any>task );
			
			if ( this.runningTasks >= this.maxLength ) {
				return;
			}
			// 启动异步任务
			this.processQueue();
		} );
	}
	
	private async processQueue() {
		if ( !this.queue.length || this.runningTasks >= this.maxLength ) {
			return;
		}
		const tasksToProcess = this.queue.splice( 0, this.maxLength - this.runningTasks );
		this.runningTasks += tasksToProcess.length;
		
		await Promise.all(
			tasksToProcess.map( async ( { asyncFunction, retries, resolve, reject } ) => {
				try {
					const result = await asyncFunction();
					resolve( result );
				} catch ( error ) {
					if ( retries < this.retryLimit ) {
						this.queue.push( { asyncFunction, retries: retries + 1, resolve, reject } );
					} else {
						reject( error );
					}
				} finally {
					this.runningTasks--;
				}
			} )
		);
		await this.processQueue();
	}
}