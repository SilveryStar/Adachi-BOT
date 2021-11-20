import { InputParameter } from "@modules/command";
import { Private } from "#genshin/module/private";
import { NoteService } from "#genshin/module/note";
import { privateClass } from "#genshin/init";

export async function main( { sendMessage, messageData }: InputParameter ): Promise<void> {
	const userID: number = messageData.user_id;
	const data: string = messageData.raw_message;
	
	const list: number[] = data.split( " " ).map( el => parseInt( el ) );
	const single: Private | string = await privateClass.getSinglePrivate( userID, <number>list.shift() );
	
	if ( typeof single === "string" ) {
		await sendMessage( single );
	} else {
		await ( <NoteService>single.services.note ).modifyTimePoint( list );
		await sendMessage( "推送时间修改成功" );
	}
}