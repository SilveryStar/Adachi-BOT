import { InputParameter, Order } from "@modules/command";
import { RenderResult } from "@modules/renderer";
import { artClass, renderer } from "../init";
import bot from "ROOT";

export async function main(
	{ sendMessage, messageData, redis, logger, auth }: InputParameter
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
		const CALL = <Order>bot.command.getSingle( "adachi.call", await auth.get( userID ) );
		const appendMsg = CALL ? `私聊使用 ${ CALL.getHeaders()[0] }` : "";
		await sendMessage( `图片渲染异常，请${ appendMsg }联系持有者进行反馈` );
	}
}