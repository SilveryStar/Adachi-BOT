import { CommonMessageEventData as Message } from "oicq";
import { Redis } from "../../../bot";
import { render } from "../utils/render";

async function main( sendMessage: ( content: string ) => any, message: Message ): Promise<void> {
	const qqID: number = message.user_id;
	const data: string | null = await Redis.getString( `silvery-star.artifact-${ qqID }` );
	
	if ( data === null ) {
		await sendMessage( "请先抽取一个圣遗物" );
		return;
	}
	const image: string = await render( "artifact", { qq: qqID, type: "rein" } );
	await sendMessage( image );
}

export { main }