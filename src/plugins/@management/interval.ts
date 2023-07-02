import { defineDirective } from "@/modules/command";
import idParser from "#/@help/utils/id-parser";
import { MessageType } from "@/modules/message";

export default defineDirective( "order", async ( { sendMessage, matchResult, interval } ) => {
	const [ id, time ] = matchResult.match;
	const [ type, targetID ] = idParser( id );
	
	if ( type === MessageType.Private ) {
		await interval.set( targetID, "private", parseInt( time ) );
		await sendMessage( `用户 ${ targetID } 的操作触发间隔已改为 ${ time }ms` );
	} else {
		await interval.set( targetID, "group", parseInt( time ) );
		await sendMessage( `群聊 ${ targetID } 的操作触发间隔已改为 ${ time }ms` );
	}
} );