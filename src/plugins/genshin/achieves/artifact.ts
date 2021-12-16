import { InputParameter } from "@modules/command";
import { RenderResult } from "@modules/renderer";
import { artClass, renderer } from "../init";

export async function main(
	{ sendMessage, messageData, redis, logger }: InputParameter
): Promise<void> {
	const userID: number = messageData.user_id;
	const domain: number = messageData.raw_message.length
						 ? parseInt( messageData.raw_message ) - 1 : -1;
	const reason: string = await artClass.get( userID, domain, redis );
	
	if ( reason !== "" ) {
		await sendMessage( reason );
		return;
	}
	const res: RenderResult = await renderer.asCqCode(
		"/artifact.html",
		{ qq: userID, type: "init" }
	);
	if ( res.code === "ok" ) {
		await sendMessage( res.data );
	} else {
		logger.error( res.error );
		await sendMessage( "图片渲染异常，请联系持有者进行反馈" );
	}
}