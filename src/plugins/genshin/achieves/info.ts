import { CommonMessageEventData as Message } from "oicq";
import { getInfo } from "../utils/api";
import { render } from "../utils/render";

async function main( sendMessage: ( content: string ) => any, message: Message ): Promise<void> {
	const name: string = message.raw_message;
	
	try {
		await getInfo( name );
		const image: string = await render( "info", { name } );
		await sendMessage( image );
	} catch ( error ) {
		await sendMessage( `暂无关于「${ name }」的信息，若确认名称输入无误，请前往 github.com/SilveryStar/Adachi-BOT 进行反馈` );
	}
}

export { main }