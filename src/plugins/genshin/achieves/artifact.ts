import { defineDirective } from "@/modules/command";
import { RenderResult } from "@/modules/renderer";
import { artClass, renderer } from "../init";

export default defineDirective( "order", async ({ sendMessage, messageData, redis, logger, auth }) => {
	const userID: number = messageData.user_id;
	const domain: number = messageData.raw_message.length
		? parseInt( messageData.raw_message ) - 1 : -1;
	const reason: string = await artClass.get( userID, domain, redis );
	
	if ( reason !== "" ) {
		await sendMessage( reason );
		return;
	}
	const res: RenderResult = await renderer.asSegment(
		"/artifact",
		{ qq: userID, type: "init" }
	);
	if ( res.code === "ok" ) {
		await sendMessage( res.data );
	} else {
		throw new Error( res.error );
	}
} );