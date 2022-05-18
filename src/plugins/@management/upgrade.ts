import fetch from "node-fetch";
import { exec } from "child_process";
import { InputParameter } from "@modules/command";
import { restart } from "pm2";
import * as os from "os";

/* 超时检查 */
function waitWithTimeout( promise: Promise<any>, timeout: number ) {
	let timer;
	const timeoutPromise = new Promise( ( _, reject ) => {
		timer = setTimeout( () => reject( `timeout: ${ timeout }ms` ), timeout );
	} );
	return Promise.race( [ timeoutPromise, promise ] )
		.finally( () => clearTimeout( timer ) );
}

/* 检查更新 */
async function getCommitsInfo(): Promise<any[]> {
	return new Promise( ( resolve, reject ) => {
		fetch( "https://api.github.com/repos/SilveryStar/Adachi-BOT/commits" )
			.then( async ( result: Response ) => {
				resolve( await result.json() );
			} )
			.catch( ( error: Error ) => {
				reject( error );
			} )
	} )
}

/* 命令执行 */
async function execHandle( command: string ): Promise<string> {
	return new Promise( ( resolve, reject ) => {
		exec( command, ( error, stdout, stderr ) => {
			if ( error ) {
				reject( error );
			} else {
				resolve( stdout );
			}
		} )
	} )
}

/* 更新 bot */
async function updateBot( { messageData, sendMessage, logger }: InputParameter ): Promise<void> {
	const isForce = messageData.raw_message === "-f";
	const command = !isForce ? "git checkout HEAD package*.json && git pull --no-rebase" : "git reset --hard && git pull --no-rebase";
	
	const execPromise = execHandle( command ).then( ( stdout: string ) => {
		logger.info( stdout );
	} );
	
	try {
		await waitWithTimeout( execPromise, 30000 );
	} catch ( error ) {
		logger.error( `更新 BOT 失败: ${ error }` );
		if ( typeof error === "string" && error.includes( "timeout" ) ) {
			await sendMessage( "更新失败，网络请求超时" );
		} else {
			await sendMessage( `更新失败，可能是网络出现问题${ !isForce ? "或存在代码冲突，若不需要保留改动代码可以追加 -f 使用强制更新" : "" }` );
		}
		return Promise.reject( error );
	}
	
	await sendMessage( "更新成功，BOT 正在自行重启，请稍后" );
	
	restart( "adachi-bot", async ( error ) => {
		logger.error( error );
		await sendMessage( `重启 BOT 出错: ${ error }` );
		return Promise.reject( error );
	} );
}

export async function main( i: InputParameter ): Promise<void> {
	if ( os.platform() === "win32" ) {
		await i.sendMessage( "Windows平台暂不支持指令更新" );
		return;
	}
	const dbKey: string = "adachi.update-time";
	
	let commits: any[] = []
	try {
		commits = await getCommitsInfo();
	} catch ( error ) {
		i.logger.error( error );
		await i.sendMessage( "检查更新出错，可能是网络波动，请重试" );
		return;
	}
	
	const newDate: string = commits[0].commit?.committer?.date;
	const oldDate: string = await i.redis.getString( dbKey );
	
	if ( !oldDate ) {
		await i.sendMessage( "初次使用该指令，将直接尝试更新 BOT" );
		try {
			await updateBot( i );
		} catch ( error ) {
			return;
		}
		await i.redis.setString( dbKey, newDate );
		return;
	}
	
	const commitsNew = commits.filter( e => {
		const commitDate: Date = new Date( e.commit?.committer?.date );
		return Number( commitDate ) - Number( new Date( oldDate ) ) > 0;
	} );
	
	if ( commitsNew.length === 0 ) {
		await i.sendMessage( "当前已经是最新版本了" );
		return;
	}
	
	await i.sendMessage( "开始尝试更新 BOT..." );
	
	try {
		await updateBot( i );
	} catch ( error ) {
		return;
	}
	await i.redis.setString( dbKey, newDate );
}