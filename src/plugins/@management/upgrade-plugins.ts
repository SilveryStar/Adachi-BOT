import fetch, { Response } from "node-fetch";
import { exec } from "child_process";
import { InputParameter } from "@/modules/command";
import { restart } from "pm2";
import { PluginAlias, PluginUpgradeServices } from "@/modules/plugin";

/* 超时检查 */
function waitWithTimeout( promise: Promise<any>, timeout: number ): Promise<any> {
	let timer;
	const timeoutPromise = new Promise( ( _, reject ) => {
		timer = setTimeout( () => reject( `timeout: ${ timeout }ms` ), timeout );
	} );
	return Promise.race( [ timeoutPromise, promise ] )
		.finally( () => clearTimeout( timer ) );
}

/* 检查更新 */
async function getCommitsInfo( repo: string ): Promise<any[]> {
	const result: Response = await fetch( repo );
	const json = await result.json();
	if ( Array.isArray( json ) ) {
		return json;
	}
	return [ json ];
}

/* 命令执行 */
async function execHandle( command: string, cwd: string ): Promise<string> {
	return new Promise( ( resolve, reject ) => {
		exec( command, { cwd }, ( error, stdout, stderr ) => {
			if ( error ) {
				reject( error );
			} else {
				resolve( stdout );
			}
		} )
	} )
}

/* 更新 plugin */
async function updateBotPlugin( {
	                                messageData,
	                                sendMessage,
	                                logger,
	                                file
                                }: InputParameter, pluginName: string, isForce: boolean = false ): Promise<void> {
	const command = !isForce ? "git pull --no-rebase" : "git reset --hard && git pull --no-rebase";
	const cwd = file.getFilePath( pluginName, "plugin" );
	const execPromise = execHandle( command, cwd ).then( ( stdout: string ) => {
		logger.info( stdout );
		if ( /(Already up[ -]to[ -]date|已经是最新的)/.test( stdout ) ) {
			throw `[${ pluginName }]当前已经是最新版本了`;
		}
	} );
	
	try {
		await waitWithTimeout( execPromise, 30000 );
	} catch ( error ) {
		logger.error( `更新 BOT Plugin:[${ pluginName }] 失败: ${ typeof error === "string" ? error : (<Error>error).message }` );
		if ( typeof error === "string" ) {
			throw error.includes( "timeout" ) ? `[${ pluginName }]更新失败，网络请求超时` : error;
		} else {
			throw `[${ pluginName }]更新失败，可能是网络出现问题${ !isForce ? "或存在代码冲突，若不需要保留改动代码可以追加 -f 使用强制更新" : "" }`;
		}
	}
}

async function checkGitCommit( dbKey: string, i: InputParameter, repo: string ): Promise<{ check: boolean; newDate?: string, error?: string }> {
	const pluginName = dbKey.split( "." )[1];
	let commits: any[] = []
	try {
		commits = await getCommitsInfo( repo );
	} catch ( error ) {
		i.logger.error( error );
		return {
			check: false,
			error: `[${ pluginName }]插件检查更新出错，可能是网络波动，请重试`
		};
	}
	
	const newDate: string = commits[0].commit?.committer?.date;
	const oldDate: string = await i.redis.getString( dbKey );
	
	if ( !oldDate ) {
		await i.sendMessage( `初次使用指令更新[${ pluginName }]，将直接尝试更新该插件。` );
		return {
			check: true,
			newDate
		};
	}
	
	const commitsNew = commits.filter( e => {
		const commitDate: Date = new Date( e.commit?.committer?.date );
		return Number( commitDate ) - Number( new Date( oldDate ) ) > 0;
	} );
	
	if ( commitsNew.length === 0 ) {
		return {
			check: false,
			error: `[${ pluginName }]插件当前已经是最新版本了`
		};
	}
	
	return {
		check: true,
		newDate
	};
}

export async function main( i: InputParameter ): Promise<void> {
	const message: string = i.messageData.raw_message;
	const reg: RegExp = new RegExp( /^(-f)?\s*(-s)?\s*([\u4E00-\u9FA5\w\-]+)?$/ );
	const execArray: RegExpExecArray | null = reg.exec( message );
	let dbKey: string = "";
	let isForce: boolean = false;
	let isRestart: boolean = true;
	if ( execArray && execArray[1] ) {
		isForce = true;
	}
	if ( execArray && execArray[2] ) {
		isRestart = false;
	}
	if ( execArray && execArray[3] ) {
		// 更新单个插件
		let pluginName: string = execArray[3];
		const originalName = PluginAlias[pluginName];
		if ( originalName ) {
			// 如果是用的别名则重置成插件的原始名称
			pluginName = originalName;
		}
		const repo: string = PluginUpgradeServices[pluginName];
		if ( !repo ) {
			await i.sendMessage( `[${ pluginName }]插件不支持热更新.` );
			return;
		}
		
		dbKey = `adachi.${ pluginName }.update-time`;
		const checkResult: { check: boolean; newDate?: string, error?: string } = await checkGitCommit( dbKey, i, repo );
		if ( !checkResult.check ) {
			if ( checkResult.newDate ) {
				await i.redis.setString( dbKey, checkResult.newDate );
			}
			if ( checkResult.error ) {
				await i.sendMessage( checkResult.error );
			}
			return;
		}
		try {
			await updateBotPlugin( i, pluginName, isForce );
			await i.sendMessage( `[${ pluginName }]插件更新完成，${ isRestart ? "正在重启服务..." : "请稍后手动重启 BOT" }` );
			if ( checkResult.newDate ) {
				await i.redis.setString( dbKey, checkResult.newDate );
			}
			if ( isRestart ) { // 重启服务
				restart( "adachi-bot", async ( error ) => {
					await i.sendMessage( `重启 BOT 出错: ${ error }` );
					throw error;
				} );
			}
		} catch ( e: any ) {
			if ( typeof e === "string" ) {
				await i.sendMessage( e );
				if ( /\[.+]当前已经是最新版本了/.test( e ) ) {
					await i.redis.setString( dbKey, checkResult.newDate || "" );
				}
			} else {
				await i.sendMessage( ( <Error>e ).message );
			}
		}
		return;
	}
	
	// 更新全部的插件
	const upgrade_plugins: string[] = [];
	const not_support_upgrade_plugins: string[] = [];
	const upgrade_errors: string[] = [];
	for ( let key in PluginUpgradeServices ) {
		const repo: string = PluginUpgradeServices[key];
		if ( repo ) {
			dbKey = `adachi.${ key }.update-time`;
			const checkResult: { check: boolean; newDate?: string, error?: string } = await checkGitCommit( dbKey, i, repo );
			if ( !checkResult.check ) {
				if ( checkResult.newDate ) {
					await i.redis.setString( dbKey, checkResult.newDate );
				}
				if ( checkResult.error ) {
					upgrade_errors.push( checkResult.error );
				}
				continue;
			}
			try {
				await updateBotPlugin( i, key, isForce );
				upgrade_plugins.push( key );
				if ( checkResult.newDate ) {
					await i.redis.setString( dbKey, checkResult.newDate );
				}
			} catch ( e ) {
				if ( typeof e === "string" ) {
					upgrade_errors.push( e );
					if ( /\[.+]当前已经是最新版本了/.test( e ) ) {
						await i.redis.setString( dbKey, checkResult.newDate || "" );
					}
				} else {
					upgrade_errors.push( ( <Error>e ).message );
				}
			}
		} else {
			not_support_upgrade_plugins.push( key );
		}
	}
	
	if ( not_support_upgrade_plugins.length > 0 ) {
		await i.sendMessage( `${ not_support_upgrade_plugins.join( "、" ) }不支持热更新` );
	}
	
	if ( upgrade_errors.length > 0 ) {
		await i.sendMessage( upgrade_errors.join( "\n\n" ) );
	}
	
	if ( upgrade_plugins.length === 0 ) {
		await i.sendMessage( "没有插件被更新!" );
		return;
	} else {
		await i.sendMessage( `${ upgrade_plugins.join( "、" ) }已完成更新，${ isRestart ? "正在重启服务..." : "请稍后手动重启 BOT" }` );
	}
	
	// 重启服务
	if ( isRestart ) {
		restart( "adachi-bot", async ( error ) => {
			i.logger.error( error );
			await i.sendMessage( `重启 BOT 出错: ${ error }` );
		} );
	}
}