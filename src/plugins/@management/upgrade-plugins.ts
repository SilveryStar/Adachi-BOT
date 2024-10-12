import fetch, { Response } from "node-fetch";
import { defineDirective, InputParameter } from "@/modules/command";
import PluginManager, { PluginInfo } from "@/modules/plugin";
import RenderServer from "@/modules/server";
import { execCommand } from "@/utils/system";
import { waitWithTimeout } from "@/utils/async";
import AsyncQueue from "@/utils/asyncQueue";
import process from "process";

class PluginUpgrade {
	/* 不支持更新的插件 */
	private notSupportUpgradePlugins: string[] = [];
	/* 初次更新的插件 */
	private initPlugin: string[] = [];
	/* 检查更新出错的插件 */
	private checkUpgradeErrors: string[] = [];
	/* 网络超时的插件 */
	private upgradeTimoutErrors: string[] = [];
	/* 更新出错的插件 */
	private upgradeErrors: string[] = [];
	/* 已经是最新版本的插件 */
	private alreadyLatest: string[] = [];
	/* 任务队列 */
	private taskQueue = new AsyncQueue( 10, 1 );
	
	constructor(
		private logger: InputParameter["logger"],
		private file: InputParameter["file"],
		private redis: InputParameter["redis"],
		private sendMessage: InputParameter["sendMessage"],
		private command: InputParameter["command"]
	) {
	}
	
	/* 检查更新 */
	private async getCommitsInfo( repo: string ): Promise<any[]> {
		const result: Response = await fetch( repo );
		const json = await result.json();
		if ( Array.isArray( json ) ) {
			return json;
		}
		return [ json ];
	}
	
	/**
	 * 更新 plugin
	 * @return 是否更新成功
	 */
	private async updateBotPlugin( pluginInfo: PluginInfo, isForce: boolean = false ): Promise<boolean> {
		const command = !isForce ? "git pull --no-rebase" : "git reset --hard && git pull --no-rebase";
		const cwd = this.file.getFilePath( pluginInfo.key, "plugin" );
		const execPromise = execCommand( command, { cwd } ).then( ( stdout: string ) => {
			this.logger.info( stdout );
			if ( /(Already up[ -]to[ -]date|已经是最新的)/.test( stdout ) ) {
				this.alreadyLatest.push( pluginInfo.key );
			}
		} );
		
		try {
			await waitWithTimeout( execPromise, 30000 );
		} catch ( error ) {
			this.logger.error( `更新 BOT Plugin:[${ pluginInfo.key }] 失败: ${ typeof error === "string" ? error : ( <Error>error ).message }` );
			if ( typeof error === "string" ) {
				// 此时网络超时
				this.upgradeTimoutErrors.push( pluginInfo.key );
			} else {
				// 更新异常
				this.upgradeErrors.push( pluginInfo.key );
			}
			return false;
		}
		
		return true;
	}
	
	/* 安装依赖 */
	private async installDependencies(): Promise<string | void> {
		try {
			const command = "pnpm i -P --no-frozen-lockfile";
			const execPromise = execCommand( command, {
				env: {
					...process.env,
					"CI": "1"
				},
				cwd: process.cwd()
			} ).then( ( stdout: string ) => {
				this.logger.info( stdout );
			} );
			await waitWithTimeout( execPromise, 60000 );
		} catch ( error ) {
			this.logger.error( `依赖安装失败: ${ typeof error === "string" ? error : ( <Error>error ).message }` );
			if ( typeof error === "string" ) {
				return error.includes( "timeout" ) ? "更新成功，依赖安装超时" : error;
			} else {
				return "依赖安装失败，请前往控制台查看错误信息。"
			}
		}
	}
	
	private async checkGitCommit( dbKey: string, repo: string ): Promise<string | null> {
		const pluginName = dbKey.split( "." )[1];
		let commits: any[] = []
		try {
			commits = await this.getCommitsInfo( repo );
			// 此时未正常获取到 commit 信息
			if ( !commits[0]?.commit ) {
				this.logger.error( `更新 BOT Plugin:[${ pluginName }] 失败: ${ commits[0]?.message || "未知原因" }` )
				this.checkUpgradeErrors.push( pluginName );
			}
		} catch ( error ) {
			this.logger.error( error );
			this.checkUpgradeErrors.push( pluginName );
			return null;
		}
		
		const newDate: string = commits[0].commit?.committer?.date;
		const oldDate: string = await this.redis.getString( dbKey );
		
		if ( !oldDate ) {
			this.initPlugin.push( pluginName )
			return newDate;
		}
		
		const commitsNew = commits.filter( e => {
			const commitDate: Date = new Date( e.commit?.committer?.date );
			return Number( commitDate ) - Number( new Date( oldDate ) ) > 0;
		} );
		
		if ( commitsNew.length === 0 ) {
			this.alreadyLatest.push( pluginName );
			return null;
		}
		
		return newDate;
	}
	
	// 获取错误提示信息
	private getErrorResult( isForce: boolean ): string[] {
		const errorResult: string[] = [];
		if ( this.notSupportUpgradePlugins.length ) {
			errorResult.push( `插件[${ this.notSupportUpgradePlugins.join( "、" ) }]不支持热更新` );
		}
		if ( this.alreadyLatest.length ) {
			errorResult.push( `插件[${ this.alreadyLatest.join( "、" ) }]当前已经是最新版本了` );
		}
		if ( this.checkUpgradeErrors.length ) {
			errorResult.push( `插件[${ this.checkUpgradeErrors.join( "、" ) }]检查更新出错，可能是网络波动，请查看日志信息` );
		}
		if ( this.upgradeTimoutErrors.length ) {
			errorResult.push( `插件[${ this.upgradeTimoutErrors.join( "、" ) }]更新失败，网络请求超时` );
		}
		if ( this.upgradeErrors.length ) {
			errorResult.push( `插件[${ this.upgradeErrors.join( "、" ) }]更新失败，可能是网络出现问题${ !isForce ? "或存在代码冲突，若不需要保留改动代码可以追加 -f 使用强制更新" : "" }` );
		}
		return errorResult;
	}
	
	// 重载插件
	private async reloadPlugin( upgradePlugins: PluginInfo[] ) {
		const errorPlugins: string[] = [];
		
		const pluginInstance = PluginManager.getInstance();
		const serverInstance = RenderServer.getInstance();
		
		for ( const pluginInfo of upgradePlugins ) {
			try {
				await pluginInstance.reloadSingle( pluginInfo.key, true, false, false );
			} catch {
				errorPlugins.push( pluginInfo.key );
			}
		}
		
		let errorMsg = errorPlugins.length ? `插件 ${ errorPlugins.join( "、" ) } 重载异常` : "";
		try {
			await this.command.reload();
			await serverInstance.reloadPluginRouters( upgradePlugins.map( info => info.key ) );
		} catch ( error ) {
			errorMsg += "，公共服务重启失败。";
		}
		
		return errorMsg;
	}
	
	// 开始更新任务
	async startTask( pluginList: PluginInfo[], isForce = false, isReload = false ): Promise<void> {
		/* 整理可用任务列表，排除无需更新、获取 commit 错误的插件，收集错误与消息内容 */
		const taskList = pluginList.map( pluginInfo => this.taskQueue.enqueue( async () => {
			if ( !pluginInfo.upgrade ) {
				this.notSupportUpgradePlugins.push( pluginInfo.key );
				return null;
			}
			const dbKey = `adachi.${ pluginInfo.key }.update-time`;
			const date = await this.checkGitCommit( dbKey, pluginInfo.upgrade );
			if ( !date ) return null;
			if ( pluginInfo.key === "meme-making" ) {
				console.log( 4 )
			}
			return {
				dbKey,
				pluginInfo,
				updateDate: date
			}
		} ) );
		// 执行任务
		const taskListResult = await Promise.all( taskList );
		// 先把初次更新的插件提示消息发出去
		if ( this.initPlugin.length ) {
			await this.sendMessage( `初次使用指令更新[${ this.initPlugin.join( "、" ) }]，将直接尝试更新这些插件。` )
		}
		
		// 成功更新的插件列表
		const upgradePlugins: PluginInfo[] = [];
		const upgradeTaskList = taskListResult
			.filter( t => t )
			.map( res => this.taskQueue.enqueue( async () => {
				if ( !res ) return;
				const updateRes = await this.updateBotPlugin( res.pluginInfo );
				if ( updateRes ) {
					upgradePlugins.push( res.pluginInfo );
					await this.redis.setString( res.dbKey, res.updateDate );
				}
			} ) );
		await Promise.all( upgradeTaskList );
		
		// 获取所有错误信息
		const errorResult = this.getErrorResult( isForce );
		
		if ( !upgradePlugins.length ) {
			errorResult.push( "\n没有插件被更新!" )
			await this.sendMessage( errorResult.join( "\n" ) );
			return;
		}
		
		errorResult.push( `\n[${ upgradePlugins.map( p => p.name ).join( "、" ) }]已完成更新，正在检查并安装依赖...` );
		await this.sendMessage( errorResult.join( "\n" ) );
		
		// 安装/更新依赖
		const errorMsg = await this.installDependencies();
		if ( errorMsg ) {
			await this.sendMessage( errorMsg );
		} else {
			await this.sendMessage( `检查安装依赖完成，${ isReload ? "正在重载插件..." : "请稍后手动重载插件" }` );
		}
		
		// 是否需要重载
		if ( isReload ) {
			const errMsg = await this.reloadPlugin( upgradePlugins );
			await this.sendMessage( errMsg || "所有插件重载完成" );
		}
	}
}

export default defineDirective( "order", async ( i ) => {
	const isForce = !!i.matchResult.match[0]; // 默认非强制更新，有第一个参数 -f 就强制更新
	const isReload = !i.matchResult.match[1]; // 默认重载，有第二个参数 -s 就不进行重载
	
	const inputPluginName = i.matchResult.match[2];
	
	const pluginInstance = PluginManager.getInstance();
	
	// 待更新的插件列表
	let upgradePluginList: PluginInfo[];
	// 更新单个插件
	if ( inputPluginName ) {
		// todo: 临时仅处理单个匹配项
		const pluginInfo = pluginInstance.getPluginInfoByAlias( inputPluginName )[0];
		if ( !pluginInfo ) {
			await i.sendMessage( `未找到名称或别名为[${ inputPluginName }]的插件，请检查输入名称是否正确。` );
			return;
		}
		upgradePluginList = [ pluginInfo ];
	} else {
		upgradePluginList = Object.values( pluginInstance.pluginList ).sort( ( prev, next ) => {
			return prev.sortIndex - next.sortIndex;
		} );
	}
	
	const upgradePluginTask = new PluginUpgrade( i.logger, i.file, i.redis, i.sendMessage, i.command );
	await upgradePluginTask.startTask( upgradePluginList, isForce, isReload );
} );