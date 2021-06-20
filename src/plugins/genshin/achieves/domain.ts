import { artClass } from "../init";

async function main( sendMessage: ( content: string ) => any ): Promise<void> {
	const info: string = artClass.domainInfo();
	await sendMessage( info );
}

export { main }