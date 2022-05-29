import { InputParameter } from "@modules/command";
import { restart } from "pm2";
import * as os from "os";

export async function main( { sendMessage, logger }: InputParameter ): Promise<void> {
	if ( os.platform() === "win32" ) {
		await sendMessage( "Windows平台暂不支持指令重启" );
		return;
	}
	await sendMessage( "开始重启 BOT，请稍后" );
	restart( "adachi-bot", async ( error ) => {
		logger.error( error );
		await sendMessage( `重启 BOT 出错: ${ error }` );
	} );
}