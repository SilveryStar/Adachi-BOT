import { InputParameter, Order } from "@modules/command";
import { RenderResult } from "@modules/renderer";
import { almanacClass, renderer } from "../init";
import bot from "ROOT";

export async function main(
	{ sendMessage, redis, logger, auth, messageData }: InputParameter
): Promise<void> {
	await redis.setString( "silvery-star.almanac", almanacClass.get() );
	const res: RenderResult = await renderer.asCqCode( "/almanac.html" );
	
	if ( res.code === "ok" ) {
		await sendMessage( res.data );
	} else {
		logger.error( res.error );
		const CALL = <Order>bot.command.getSingle( "adachi.call", await auth.get( messageData.user_id ) );
		const appendMsg = CALL ? `私聊使用 ${ CALL.getHeaders()[0] }` : "";
		await sendMessage( `图片渲染异常，请${ appendMsg }联系持有者进行反馈` );
	}
}