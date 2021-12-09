import { Private } from "#genshin/module/private/main";
import { InputParameter } from "@modules/command";
import { NoteService } from "#genshin/module/private/note";
import { privateClass } from "#genshin/init";

export async function main( { sendMessage, messageData }: InputParameter ): Promise<void> {
	const userID: number = messageData.user_id;
	const data: string = messageData.raw_message;
	
	const list: number[] = data.split( " " ).map( el => parseInt( el ) );
	const single: Private | string = await privateClass.getSinglePrivate( userID, <number>list.shift() );
	
	if ( typeof single === "string" ) {
		await sendMessage( single );
	} else {
		await single.services[ NoteService.FixedField ].modifyTimePoint( list );
		await sendMessage( "推送时间修改成功" );
	}
}