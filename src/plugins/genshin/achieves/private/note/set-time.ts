import { Private } from "#/genshin/module/private/main";
import { defineDirective } from "@/modules/command";
import { NoteService } from "#/genshin/module/private/note";
import { privateClass } from "#/genshin/init";

export default defineDirective( "order", async ( { messageData, sendMessage, matchResult } ) => {
	const userID: number = messageData.user_id;
	const data: string = matchResult.match[0];
	
	const list: number[] = data.split( " " ).map( el => parseInt( el ) );
	const single: Private | string = await privateClass.getSinglePrivate( userID, <number>list.shift() );
	
	if ( typeof single === "string" ) {
		await sendMessage( single );
	} else {
		await single.services[NoteService.FixedField].modifyTimePoint( list );
		await sendMessage( "推送时间修改成功" );
	}
} );