import { EventMap } from "../types/map/event";
import { NoticeGroupEvent, NoticePrivateEvent } from "@/modules/lib";
import { ActionResponse } from "@/modules/lib/types/action";

interface EventMapListener {
	listener: EventMap[ keyof EventMap ];
	once: boolean;
}

type ApiListener = ( data: ActionResponse ) => any;

export default class EventEmitter {
	private static __instance: EventEmitter;
	private eventMap: Map<keyof EventMap, EventMapListener[]> = new Map();
	private apiMap: Map<string, ApiListener[]> = new Map();
	
	public static getInstance() {
		if ( !EventEmitter.__instance ) {
			EventEmitter.__instance = new EventEmitter();
		}
		return EventEmitter.__instance;
	}
	
	private onHandle<T extends keyof EventMap>( event: T, listener: EventMap[T], once: boolean ) {
		const listeners = this.eventMap.get( event );
		if ( listeners ) {
			listeners.push( { listener, once } );
		} else {
			this.eventMap.set( event, [ { listener, once } ] );
		}
	}
	
	public onApi( event: string, listener: ApiListener ) {
		const listeners = this.apiMap.get( event );
		if ( listeners ) {
			listeners.push( listener );
		} else {
			this.apiMap.set( event, [ listener ] );
		}
	}
	
	public emitApi( event: string, data: ActionResponse ) {
		const listeners = this.apiMap.get( event ) || [];
		listeners.slice().forEach( item => {
			item( data );
		} );
		this.apiMap.delete( event );
	}
	
	public on<T extends keyof EventMap>( event: T, listener: EventMap[T] ) {
		this.onHandle( event, listener, false );
	}
	
	public once<T extends keyof EventMap>( event: T, listener: EventMap[T] ) {
		this.onHandle( event, listener, true );
	}
	
	public off<T extends keyof EventMap>( event: T, listener: EventMap[T] ) {
		const listeners = this.eventMap.get( event );
		if ( listeners ) {
			const index = listeners.findIndex( item => item.listener === listener );
			if ( index !== -1 ) {
				listeners.splice( index, 1 );
			}
		}
	}
	
	public emit<T extends keyof EventMap>( event: T, ...data: Parameters<EventMap[T]> ) {
		const listeners = this.eventMap.get( event ) || [];
		listeners.forEach( item => {
			// @ts-ignore
			item.listener( ...data );
			if ( item.once ) {
				// @ts-ignore
				this.off( event, item.listener );
			}
		} );
	}
	
	public checkNoticePrivateEvent( data: NoticePrivateEvent | NoticeGroupEvent ): data is NoticePrivateEvent {
		return [ "friend_add", "friend_recall" ].includes( data.notice_type );
	}
}