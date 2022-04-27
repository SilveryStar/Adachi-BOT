import { exec } from "child_process";
import { InputParameter } from "@modules/command";
import { restart } from "pm2";
import * as os from "os";

export async function main( { sendMessage, logger }: InputParameter ): Promise<void> {
	if ( os.platform() === 'win32' ) {
		await sendMessage( '抱歉，技术有限Windows平台暂不支持指令更新!' )
		return;
	}
	
	await exec( 'git checkout HEAD package*.json && git pull --no-rebase', ( error, stdout, stderr ) => {
		if ( error ) {
			logger.warn( "拉取代码失败, reason:", error.stack || error.message );
			sendMessage( `拉取代码失败, reason: ${ error.message || '请在日志中查看更多信息' }` );
		} else if ( stderr ) {
			logger.warn( stderr );
			sendMessage( `拉取代码失败, reason: ${ stderr }` );
		} else {
			logger.info( stdout );
			restart( 'adachi-bot', ( err ) => {
				logger.error( err );
			} );
		}
	} )
}