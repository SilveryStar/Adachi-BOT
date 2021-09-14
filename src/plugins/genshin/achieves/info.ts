import { CommonMessageEventData as Message } from "oicq";
import { NameResult, getRealName } from "../utils/name";
import { render } from "../utils/render";

async function main( sendMessage: ( content: string ) => any, message: Message ): Promise<void> {
	const name: string = message.raw_message;
	const result: NameResult = getRealName( name );
	
	if ( result.definite ) {
		const image: string = await render( "info", { name: result.info } );
		await sendMessage( image );
	} else if ( result.info === "" ) {
		await sendMessage( `暂无关于「${ name }」的信息，若确认名称输入无误，请前往 github.com/SilveryStar/Adachi-BOT 进行反馈` );
	} else {
		await sendMessage( `未找到相关信息，是否要找：${ [ "", ...result.info as string[] ].join( "\n  - " ) }` );
	}
}

export { main }