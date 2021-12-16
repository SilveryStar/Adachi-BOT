import { InputParameter } from "@modules/command";
import { RenderResult } from "@modules/renderer";
import { almanacClass, renderer } from "../init";

export async function main(
	{ sendMessage, redis, logger }: InputParameter
): Promise<void> {
	await redis.setString( "silvery-star.almanac", almanacClass.get() );
	const res: RenderResult = await renderer.asCqCode( "/almanac.html" );
	
	if ( res.code === "ok" ) {
		await sendMessage( res.data );
	} else {
		logger.error( res.error );
		await sendMessage( "图片渲染异常，请联系持有者进行反馈" );
	}
}