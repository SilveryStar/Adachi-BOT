import {
	ForwardElem,
	ForwardElemCustomNode,
	ForwardElemNode,
	MessageElem,
	Sendable
} from "@/modules/lib/types/element/send";
import { MessageRecepElem } from "@/modules/lib/types/element";
import { ForwardElemParam } from "@/modules/lib/types/api";

export function checkForwardNode( node: ForwardElemCustomNode | ForwardElemNode ): node is ForwardElemCustomNode {
	return !!( <ForwardElemCustomNode>node ).content;
}

export function makeForwardMessage( message: ForwardElem ): ForwardElemParam[] {
	return message.messages.map( m => {
		const data: any = { ...m };
		if ( checkForwardNode( m ) ) {
			data.content = formatSendMessage( m.content );
		}
		return {
			type: "node",
			data
		}
	} );
}

/** 实体化处理 */
export function materialize( content: any ): string {
	try {
		return content.toString()
			.replace( /&(?!(amp|#91|#93|#44);)/g, "&amp;" )
			.replace( /\[/g, "&#91;" )
			.replace( /]/g, "&#93;" )
			.replace( /,/g, "&#44;" )
	} catch {
		return "";
	}
}

/** 反向实体化处理 */
export function reMaterialize( content: string ): string {
	return content
		.replace( /&amp;/g, "&" )
		.replace( /&#91;/g, "[" )
		.replace( /&#93;/g, "]" )
		.replace( /&#44;/g, "," )
}

export function toMessageElem( message: Sendable ): MessageElem[] {
	message = message instanceof Array ? message : [ message ];
	return message.map( msg => {
		if ( typeof msg === "string" ) {
			return { type: "text", text: msg };
		}
		return msg;
	} )
}

export function formatSendMessage( message: Sendable ) {
	message = message instanceof Array ? message : [ message ];
	return message.map( msg => {
		if ( typeof msg === "string" ) {
			return {
				type: "text",
				data: {
					text: msg
				}
			};
		}
		
		let data: any, type: string;
		if ( msg.type === "musicCustom" ) {
			type = "music";
			data = {
				...msg,
				type: "custom"
			}
		} else {
			type = msg.type;
			data = { ...msg };
			Reflect.deleteProperty( data, "type" );
			if ( msg.type === "json" ) {
				data.data = materialize( JSON.stringify( msg.data ) );
			}
			if ( msg.type === "image" || msg.type === "record" || msg.type === "video" ) {
				if ( msg.file instanceof Buffer ) {
					data.file = "base64://" + msg.file.toString( "base64" );
				}
			}
			if ( msg.type === "image" || msg.type === "contact" || msg.type === "poke" || msg.type === "music" ) {
				if ( msg.dataType ) {
					data.type = msg.dataType;
					Reflect.deleteProperty( data, "dataType" );
				}
			}
		}
		return { type, data };
	} );
}

/** 将 cq 码转换为 messageElem 元素 */
export function toMessageRecepElem( message: string ): MessageRecepElem[] {
	return message.split( /(\[|])/g )
		.filter( str => ![ "", "[", "]" ].includes( str ) )
		.map( str => {
			const result = /^CQ:(.+?)(?:,(.+))?$/.exec( str );
			if ( !result ) {
				// 此时为纯文本
				return {
					type: "text",
					data: {
						text: str
					}
				};
			}
			// 此时为 cq 码
			const [ , type, paramStr ] = result;
			return <MessageRecepElem>{
				type,
				data: Object.fromEntries(
					<any[]>paramStr.split( "," ).map( str => {
						const splitIndex = str.indexOf( "=" );
						if ( splitIndex === -1 ) return null;
						
						const key = str.slice( 0, splitIndex );
						const value = str.slice( splitIndex + 1 );
						/* 去除部分实现端 CQ 码中多余的 type 属性 */
						if ( key === "type" && value === type ) {
							return null;
						}
						
						return [ key, value ];
					} ).filter( Boolean )
				)
			}
		} );
}

/** 暂不支持合并转发消息的转换 */
export function toCqCode<T extends { type: string, data: Record<string, any> }[]>( message: T ) {
	return message.map( msg => {
		if ( msg.type === "text" ) {
			return msg.data.text;
		}
		const paramStr = Object.entries( msg.data ).map( ( [ key, value ] ) => {
			return `${ key }=${ materialize( value ) }`;
		} ).join( "," );
		return `[CQ:${ msg.type },${ paramStr }]`;
	} ).join( "" );
}