import { CommonMessageEventData as Message } from "oicq";
import { CommandMatchResult } from "../../../modules/command";
import { sendType } from "../../../modules/message";
import { ErrorMsg } from "../utils/promise";
import { Private, UserInfo } from "../module/private";
import { NoteService } from "../module/note";
import { getHeader as h } from "../utils/header";
import { privateClass } from "../init";

async function getNowNote( qqID: number ): Promise<string[]> {
	const settings: UserInfo[] = privateClass.getUserInfoList( qqID );
	if ( settings.length === 0 ) {
		return [ "你还未订阅过任何账号" ];
	}
	
	// const imageList: string[] = [];
	// for ( let s of settings ) {
	// 	const cookie: string = s.cookie;
	// 	imageList.push( cookie );
	// 	await render( "note", {} );
	// }
	// return imageList;
	
	return [ "施工中，当前版本仅包含推送功能，主动查询暂未开放" ];
}

async function modifyTimePoint( qqID: number, data: string ): Promise<string> {
	const list: number[] = data.split( " " ).map( el => parseInt( el ) );
	const single: Private | string = privateClass.getSinglePrivate( qqID, list.shift() as number );
	
	if ( typeof single === "string" ) {
		return single;
	} else {
		await ( single.services.note as NoteService ).modifyTimePoint( list );
		return "推送时间修改成功";
	}
}

async function main( sendMessage: sendType, message: Message, match: CommandMatchResult ): Promise<void> {
	const qqID: number = message.user_id;
	const data: string = message.raw_message;
	let respMsg: string = "";
	
	switch ( match.data ) {
		/* 修改提醒时间 */
		case h( "silvery-star.note-set-time" )[0]:
			respMsg = await modifyTimePoint( qqID, data );
			break;
		/* 渲染便笺 */
		case h( "silvery-star.now-note" )[0]:
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