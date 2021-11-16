import { InputParameter } from "@modules/command";
import { render } from "../utils/render";

export async function main( { sendMessage, messageData, redis }: InputParameter ): Promise<void> {
	const qqID: number = messageData.user_id;
	const data: string | null = await redis.getString( `silvery-star.artifact-${ qqID }` );
	
	if ( data === null ) {
		await sendMessage( "请先抽取一个圣遗物" );
		return;
	}
	const image: string = await render(
		"artifact",
		{ qq: qqID, type: "rein" }
	);
	await sendMessage( image );
}