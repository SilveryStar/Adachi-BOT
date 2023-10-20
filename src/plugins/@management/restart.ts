import { defineDirective } from "@/modules/command";
import pm2 from "pm2";

export default defineDirective( "order", async ( { sendMessage, logger } ) => {
	await sendMessage( "开始重启 BOT，请稍后" );
	pm2.restart( "adachi-bot", async ( error ) => {
		logger.error( error );
		await sendMessage( `重启 BOT 出错: ${ error }` );
	} );
} );