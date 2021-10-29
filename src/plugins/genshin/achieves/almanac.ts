import { sendType } from "../../../modules/message";
import { render } from "../utils/render";
import { almanacClass } from "../init";

async function main( sendMessage: sendType ): Promise<void> {
	const image: string = await render( "almanac", { data: almanacClass.get() } );
	await sendMessage( image );
}

export { main }