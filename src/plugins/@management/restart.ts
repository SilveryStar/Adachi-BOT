import { InputParameter } from "@/modules/command";
import { restart } from "pm2";

export async function main( { sendMessage, logger }: InputParameter ): Promise<void> {
	await sendMessage( "开始重启 BOT，请稍后" );
	restart( "adachi-bot", async ( error ) => {
		logger.error( error );
		await sendMessage( `重启 BOT 出错: ${ error }` );
	} );
}