import { artClass } from "../init";
import { sendType } from "../../../modules/message";

async function main( sendMessage: sendType ): Promise<void> {
	const info: string = artClass.domainInfo();
	await sendMessage( info );
}

export { main }