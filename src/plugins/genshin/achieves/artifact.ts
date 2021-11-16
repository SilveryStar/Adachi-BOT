import { InputParameter } from "@modules/command";
import { render } from "../utils/render";
import { artClass } from "../init";

export async function main( { sendMessage, messageData, redis }: InputParameter ): Promise<void> {
	const qqID: number = messageData.user_id;
	const domain: number = messageData.raw_message.length
						 ? parseInt( messageData.raw_message ) - 1 : -1;
	const reason: string = await artClass.get( qqID, domain, redis );
	
	if ( reason !== "" ) {
		await sendMessage( reason );
		return;
	}
	const image: string = await render(
		"artifact",
		{ qq: qqID, type: "init" } );
	await sendMessage( image );
}