import fetch, { Response } from "node-fetch";
import { exec } from "child_process";
import { defineDirective, InputParameter } from "@/modules/command";
import PluginManager, { PluginInfo } from "@/modules/plugin";
import RenderServer from "@/modules/server";
import { isEqualObject } from "@/utils/object";

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
async function updateBotPlugin( i: InputParameter, pluginInfo: PluginInfo, isForce: boolean = false ): Promise<void> {
	const { messageData, sendMessage, logger, file } = i;
	const command = !isForce ? "git pull --no-rebase" : "git reset --hard && git pull --no-rebase";
	const cwd = file.getFilePath( pluginInfo.key, "plugin" );
	const execPromise = execHandle( command, cwd ).then( ( stdout: string ) => {
		logger.info( stdout );
		if ( /(Already up[ -]to[ -]date|已经是最新的)/.test( stdout ) ) {
			throw `[${ pluginInfo.name }]当前已经是最新版本了`;
		}
	} );
	
	try {
		await waitWithTimeout( execPromise, 30000 );
	} catch ( error ) {
		logger.error( `更新 BOT Plugin:[${ pluginInfo.name }] 失败: ${ typeof error === "string" ? error : ( <Error>error ).message }` );
		if ( typeof error === "string" ) {
			throw error.includes( "timeout" ) ? `[${ pluginInfo.name }]更新失败，网络请求超时` : error;
		} else {
			throw `[${ pluginInfo.name }]更新失败，可能是网络出现问题${ !isForce ? "或存在代码冲突，若不需要保留改动代码可以追加 -f 使用强制更新" : "" }`;
		}
	}
}

async function checkGitCommit( dbKey: string, i: InputParameter, repo: string ): Promise<{
	check: boolean;
	newDate?: string,
	error?: string
}> {
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

export default defineDirective( "order", async ( i ) => {
	let dbKey: string = "";
	let isForce: boolean = false;
	let isRestart: boolean = true;
	
	const pluginInstance = PluginManager.getInstance();
	const serverInstance = RenderServer.getInstance();
	
	if ( i.matchResult.match[0] ) {
		isForce = true;
	}
	if ( i.matchResult.match[1] ) {
		isRestart = false;
	}
	
	if ( i.matchResult.match[2] ) {
		// 更新单个插件
		const inputPluginName = i.matchResult.match[2];
		// todo: 临时仅处理单个匹配项
		const pluginInfo = pluginInstance.getPluginInfoByAlias( inputPluginName )[0];
		if ( !pluginInfo ) {
			await i.sendMessage( `未找到名称或别名为[${ inputPluginName }]的插件，请检查输入名称是否正确。` );
			return;
		}
		const { key: pluginKey, name: pluginName, upgrade } = pluginInfo;
		if ( !upgrade ) {
			await i.sendMessage( `插件[${ pluginName }]不支持热更新。` );
			return;
		}
		
		dbKey = `adachi.${ pluginKey }.update-time`;
		const checkResult: {
			check: boolean;
			newDate?: string,
			error?: string
		} = await checkGitCommit( dbKey, i, upgrade );
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
			await updateBotPlugin( i, pluginInfo, isForce );
			await i.sendMessage( `[${ pluginName }]插件更新完成，${ isRestart ? "正在重载插件..." : "请稍后手动重载插件" }` );
			if ( checkResult.newDate ) {
				await i.redis.setString( dbKey, checkResult.newDate );
			}
			if ( isRestart ) { // 重载
				try {
					await pluginInstance.reloadSingle( pluginKey );
				} catch ( error ) {
					await i.sendMessage( `[${ pluginName }]插件重载异常: ${ error }` );
				}
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
	const upgrade_plugins: PluginInfo[] = [];
	const not_support_upgrade_plugins: PluginInfo[] = [];
	const upgrade_errors: string[] = [];
	
	const pluginList = Object.values( pluginInstance.pluginList ).sort( ( prev, next ) => {
		return prev.sortIndex - next.sortIndex;
	} );
	
	for ( const pluginInfo of pluginList ) {
		if ( !pluginInfo.upgrade ) {
			not_support_upgrade_plugins.push( pluginInfo );
			continue;
		}
		dbKey = `adachi.${ pluginInfo.key }.update-time`;
		const checkResult: {
			check: boolean;
			newDate?: string,
			error?: string
		} = await checkGitCommit( dbKey, i, pluginInfo.upgrade );
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
			await updateBotPlugin( i, pluginInfo, isForce );
			upgrade_plugins.push( pluginInfo );
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
	}
	
	if ( not_support_upgrade_plugins.length > 0 ) {
		const pluginNames = not_support_upgrade_plugins.map( p => p.name ).join( "、" );
		await i.sendMessage( `${ pluginNames }不支持热更新` );
	}
	
	if ( upgrade_errors.length > 0 ) {
		await i.sendMessage( upgrade_errors.join( "\n\n" ) );
	}
	
	if ( upgrade_plugins.length === 0 ) {
		await i.sendMessage( "没有插件被更新!" );
		return;
	} else {
		const pluginNames = upgrade_plugins.map( p => p.name ).join( "、" );
		await i.sendMessage( `${ pluginNames }已完成更新，${ isRestart ? "正在重载插件..." : "请稍后手动重载插件" }` );
	}
	
	// 重载插件
	if ( isRestart ) {
		const errorPlugins: string[] = [];
		
		let needRestartServer = false;
		for ( const pluginInfo of upgrade_plugins ) {
			try {
				const {
					oldSetting,
					newSetting
				} = await pluginInstance.reloadSingle( pluginInfo.key, true, false, false );
				if ( !isEqualObject( oldSetting, newSetting ) ) {
					needRestartServer = true;
				}
			} catch {
				errorPlugins.push( pluginInfo.key );
			}
		}
		
		let errorMsg = errorPlugins.length ? `插件 ${ errorPlugins.join( "、" ) } 重载异常` : "";
		try {
			await i.command.reload();
			if ( needRestartServer ) {
				await serverInstance.reloadServer();
			} else {
				await serverInstance.reloadPluginRouters( pluginInstance.pluginList );
			}
		} catch ( error ) {
			errorMsg += "，公共服务重启失败。";
		}
		
		await i.sendMessage( errorMsg || "所有插件重载完成" );
	}
} );