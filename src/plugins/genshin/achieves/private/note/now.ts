import { Private } from "#genshin/module/private/main";
import { NoteService } from "#genshin/module/private/note";
import { InputParameter } from "@modules/command";
import { render } from "#genshin/utils/render";
import { privateClass } from "#genshin/init";

async function getNowNote( userID: number ): Promise<string[]> {
	const accounts: Private[] = privateClass.getUserPrivateList( userID );
	if ( accounts.length === 0 ) {
		return [ "你还未订阅过任何账号" ];
	}
	
	const imageList: string[] = [];
	for ( let a of accounts ) {
		const data: string = await ( <NoteService>a.services[ NoteService.FixedField ] ).toBase64();
		const image: string = await render( "note", { data } );
		imageList.push( image );
	}
	return imageList;
}

export async function main( { sendMessage, messageData }: InputParameter ): Promise<void> {
	const userID: number = messageData.user_id;
	const res: string[] = await getNowNote( userID );
	
	for ( let msg of res ) {
		await sendMessage( msg );
	}
}