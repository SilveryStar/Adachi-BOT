import bot from "ROOT";
import { Sendable } from "icqq";
import { Private } from "#/genshin/module/private/main";
import { NoteService } from "#/genshin/module/private/note";
import { defineDirective } from "@/modules/command";
import { RenderResult } from "@/modules/renderer";
import { privateClass, renderer } from "#/genshin/init";

async function getNowNote( userID: number ): Promise<Sendable[]> {
	const accounts: Private[] = privateClass.getUserPrivateList( userID );
	if ( accounts.length === 0 ) {
		return [ "你还未订阅过任何账号" ];
	}
	
	const imageList: Sendable[] = [];
	for ( let a of accounts ) {
		let data: string;
		try {
			data = await a.services[NoteService.FixedField].toJSON();
		} catch ( error ) {
			imageList.push( ( <Error>error ).message );
			continue;
		}
		const uid: string = a.setting.uid;
		
		const dbKey: string = `silvery-star.note-temp-${ uid }`;
		await bot.redis.setString( dbKey, data );
		const res: RenderResult = await renderer.asSegment(
			"/note", { uid }
		);
		if ( res.code === "ok" ) {
			imageList.push( res.data );
		} else {
			throw new Error( res.error );
		}
	}
	return imageList;
}

export default defineDirective( "order", async ( { sendMessage, messageData } ) => {
	const userID: number = messageData.user_id;
	const res: Sendable[] = await getNowNote( userID );
	
	for ( let msg of res ) {
		await sendMessage( msg );
	}
} );