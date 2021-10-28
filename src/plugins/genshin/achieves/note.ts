import { CommonMessageEventData as Message } from "oicq";
import { OrderMatch } from "../../../modules/command";
import { sendType } from "../../../modules/message";
import { ErrorMsg } from "../utils/promise";
import { Private } from "../module/private";
import { NoteService } from "../module/note";
import { AuthLevel, getAuthLevel } from "../../../modules/auth";
import { existHeader as e } from "../utils/header";
import { render } from "../utils/render";
import { privateClass } from "../init";

async function getNowNote( qqID: number ): Promise<string[]> {
	const accounts: Private[] = privateClass.getUserPrivateList( qqID );
	if ( accounts.length === 0 ) {
		return [ "你还未订阅过任何账号" ];
	}
	
	const imageList: string[] = [];
	for ( let a of accounts ) {
		const data: string = await ( a.services.note as NoteService ).toBase64();
		const image: string = await render( "note", { data } );
		imageList.push( image );
	}
	return imageList;
}

async function modifyTimePoint( qqID: number, data: string ): Promise<string> {
	const list: number[] = data.split( " " ).map( el => parseInt( el ) );
	const single: Private | string = await privateClass.getSinglePrivate( qqID, list.shift() as number );
	
	if ( typeof single === "string" ) {
		return single;
	} else {
		await ( single.services.note as NoteService ).modifyTimePoint( list );
		return "推送时间修改成功";
	}
}

async function main( sendMessage: sendType, message: Message, match: OrderMatch ): Promise<void> {
	const qqID: number = message.user_id;
	const data: string = message.raw_message;
	let respMsg: string = "";
	
	const header = match.header as string;
	const auth: AuthLevel = await getAuthLevel( qqID );
	switch ( true ) {
		/* 修改提醒时间 */
		case e( header, "silvery-star.note-set-time", auth ):
			respMsg = await modifyTimePoint( qqID, data );
			break;
		/* 渲染便笺 */
		case e( header, "silvery-star.now-note", auth ):
			const res: string[] = await getNowNote( qqID );
			for ( let msg of res ) {
				await sendMessage( msg );
			}
			return;
		default:
			respMsg = ErrorMsg.UNKNOWN;
	}
	
	await sendMessage( respMsg );
}

export { main }