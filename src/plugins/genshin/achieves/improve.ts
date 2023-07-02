import { defineDirective } from "@/modules/command";
import { RenderResult } from "@/modules/renderer";
import { renderer } from "#/genshin/init";

export default defineDirective( "order", async ( { sendMessage, messageData, redis } ) => {
	const userID: number = messageData.user_id;
	const data: string | null = await redis.getString( `silvery-star.artifact-${ userID }` );
	
	if ( data === null ) {
		await sendMessage( "请先抽取一个圣遗物" );
		return;
	}
	const res: RenderResult = await renderer.asSegment(
		"/artifact",
		{ qq: userID, type: "rein" }
	);
	if ( res.code === "ok" ) {
		await sendMessage( res.data );
	} else {
		throw new Error( res.error );
	}
} );