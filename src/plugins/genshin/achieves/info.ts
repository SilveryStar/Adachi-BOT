import { InputParameter } from "@modules/command";
import { RenderResult } from "@modules/renderer";
import { NameResult, getRealName } from "../utils/name";
import { renderer } from "#genshin/init";

export async function main(
	{ sendMessage, messageData, logger }: InputParameter
): Promise<void> {
	const name: string = messageData.raw_message;
	const result: NameResult = getRealName( name );
	
	if ( result.definite ) {
		const res: RenderResult = await renderer.asCqCode(
			"/info.html",
			{ name: result.info }
		);
		if ( res.code === "ok" ) {
			await sendMessage( res.data );
		} else {
			logger.error( res.error );
			await sendMessage( "图片渲染异常，请联系持有者进行反馈" );
		}
	} else if ( result.info === "" ) {
		await sendMessage( `暂无关于「${ name }」的信息，若确认名称输入无误，请前往 github.com/SilveryStar/Adachi-BOT 进行反馈` );
	} else {
		await sendMessage( `未找到相关信息，是否要找：${ [ "", ...<string[]>result.info ].join( "\n  - " ) }` );
	}
}