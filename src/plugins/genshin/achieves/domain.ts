import { defineDirective } from "@/modules/command";
import { artClass } from "../init";

export default defineDirective( "order", async ( { sendMessage } ) => {
	const info: string = artClass.domainInfo();
	await sendMessage( info );
} );