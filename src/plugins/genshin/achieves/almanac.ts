import { InputParameter } from "@modules/command";
import { render } from "../utils/render";
import { almanacClass } from "../init";

export async function main( { sendMessage }: InputParameter ): Promise<void> {
	const image: string = await render(
		"almanac",
		{ data: almanacClass.get() }
	);
	await sendMessage( image );
}