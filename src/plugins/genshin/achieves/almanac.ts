import { defineDirective } from "@/modules/command";
import { RenderResult } from "@/modules/renderer";
import { almanacClass, renderer } from "../init";

export default defineDirective( "order", async ({ sendMessage, redis, logger, auth, messageData }) => {
	await redis.setString( "silvery-star.almanac", almanacClass.get() );
	const res: RenderResult = await renderer.asSegment( "/almanac" );
	
	if ( res.code === "ok" ) {
		await sendMessage( res.data );
	} else {
		throw new Error( res.error );
	}
} );