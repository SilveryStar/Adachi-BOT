import { CommonMessageEventData as Message } from "oicq";
import { artClass } from "../init";
import { render } from "../utils/render";

async function main( sendMessage: ( content: string ) => any, message: Message ): Promise<void> {
	const qqID: number = message.user_id;
	const domain: number = message.raw_message === "" ? -1 : parseInt( message.raw_message ) - 1;
	const reason: string = await artClass.get( qqID, domain );
	
	if ( reason !== "" ) {
		await sendMessage( reason );
		return;
	}
	const image: string = await render( "artifact", { qq: qqID, type: "init" } );
	await sendMessage( image );
}

export { main }