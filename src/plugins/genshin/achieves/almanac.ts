import { sendType } from "../../../modules/message";
import { render } from "../utils/render";

async function main( sendMessage: sendType ): Promise<void> {
	const image: string = await render( "https://genshin.pub/", {}, ".GSAlmanacs_gs_almanacs__3qT_A" );
	await sendMessage( image );
}

export { main }