import { InputParameter } from "@modules/command";
import { artClass } from "../init";

export async function main( { sendMessage }: InputParameter ): Promise<void> {
	const info: string = artClass.domainInfo();
	await sendMessage( info );
}