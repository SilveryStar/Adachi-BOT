import { EventEmitter } from "events";

export type Unsubscribe = () => void;

export interface Channel<T> {
	publish: ( msg: T ) => void;
	subscribe: ( fn: ( msg: T ) => void ) => Unsubscribe;
	clear: () => void;
}

export function createChannel<T>(): Channel<T> {
	const emitter = new EventEmitter();
	// 取消警告，默认超过十个监听会警告
	emitter.setMaxListeners( 0 );
	
	return {
		publish( msg: T ) {
			emitter.emit( "message", msg );
		},
		subscribe( fn: ( msg: T ) => void ) {
			emitter.on( "message", fn );
			return () => emitter.off( "message", fn );
		},
		clear() {
			emitter.removeAllListeners( "message" );
		}
	};
}
