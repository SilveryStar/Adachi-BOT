import { Adachi, groupCommands, privateCommands } from "../bot";
import { ROOTPATH } from "../../app";
import { readdirSync } from "fs";
import { loadYAML, writeYAML } from "../utils/config";
import { resolve } from "path";
import { Command, CommandType, isOrder, isQuestion, isSwitch } from "./command";
import { MessageScope } from "./message";
import { AuthLevel } from "./auth";

declare function require( moduleName: string ): any;

async function loadPlugins(): Promise<void> {
	let folder: string[] = readdirSync( resolve( `${ ROOTPATH }/src/plugins` ) );
	
	for ( let i = AuthLevel.Banned; i <= AuthLevel.Master; i++ ) {
		groupCommands[i] = [];
		privateCommands[i] = [];
	}
	
	/* 从 plugins 文件夹从导入 init.ts 进行插件初始化 */
	for ( let pluginName of folder ) {
		const pluginPath: string = resolve( `${ ROOTPATH }/src/plugins/${ pluginName }/init` );
		
		const { init } = require( pluginPath );
		const { name, commands } = await init();
		
		for ( let command of commands ) {
			for ( let auth = command.authLimit; auth <= AuthLevel.Master; auth++ ) {
				if ( ( command.scope & MessageScope.Group ) !== 0 ) {
					groupCommands[auth].push( command );
				}
				if ( ( command.scope & MessageScope.Private ) !== 0 ) {
					privateCommands[auth].push( command );
				}
			}
		}
		
		Adachi.logger.info( `插件 ${ name } 已成功加载` );
	}
	
	for ( let i = AuthLevel.Banned; i <= AuthLevel.Master; i++ ) {
		groupCommands[i].sort( ( A: Command, B: Command ) => {
			return A.compare() - B.compare();
		} );
		privateCommands[i].sort( ( A: Command, B: Command ) => {
			return A.compare() - B.compare();
		} );
	}
}

function addPlugin( name: string, ...commandList: CommandType[] ): { name: string, commands: Command[] } {
	let commands: Command[] = [];
	const file: Record<string, any> = loadYAML( "commands" );
	
	const dAuth = AuthLevel.User;
	const dScope = MessageScope.Both;
	
	for ( let comm of commandList ) {
		comm.main = comm.main || "index";
		const key: string = comm.key;
		const data: any | undefined = file[key];
		
		/*
		* Order 可配置选项
		* enable auth scope headers
		* */
		if ( isOrder( comm ) ) {
			const dOrderConfig = {
				type: "order",
				auth: comm.authLimit || dAuth,
				scope: comm.scope || dScope
			};
			
			if ( !data ) {
				file[key] = dOrderConfig;
				file[key].enable = true;
				file[key].headers = comm.headers;
			} else if ( Array.isArray( data ) ) {
				/* 兼容 v2.0 配置 */
				const enable: boolean = data.length !== 0;
				file[key] = dOrderConfig;
				file[key].enable = enable;
				file[key].headers = enable ? data : comm.headers;
				if ( !enable ) {
					continue;
				}
			} else {
				const enable: boolean = data.enable;
				if ( !enable ) {
					continue;
				}
				comm.headers = data.headers;
				comm.authLimit = data.auth;
				comm.scope = data.scope;
			}
		}
		
		/*
		* Switch 可配置选项
		* enable auth scope header onKeyword offKeyword
		* */
		if ( isSwitch( comm ) ) {
			const dSwitchConfig = {
				type: "switch",
				auth: comm.authLimit || dAuth,
				scope: comm.scope || dScope,
				on: comm.onKeyword,
				off: comm.offKeyword
			};
			
			if ( !data ) {
				file[key] = dSwitchConfig;
				file[key].enable = true;
				file[key].header = comm.header;
				file[key].mode = comm.mode;
			} else if ( Array.isArray( data ) ) {
				/* 兼容 v2.0 配置 */
				const enable: boolean = data.length !== 0;
				file[key] = dSwitchConfig;
				file[key].enable = enable;
				file[key].mode = comm.mode;
				/* 只保留一个指令头 */
				file[key].header = enable ? data[0] : comm.header;
				if ( !enable ) {
					continue;
				}
			} else {
				const enable: boolean = data.enable;
				if ( !enable ) {
					continue;
				}
				comm.mode = data.mode;
				comm.header = data.header;
				comm.authLimit = data.auth;
				comm.scope = data.scope;
				comm.onKeyword = data.on;
				comm.offKeyword = data.off;
			}
		}
		
		/*
		* Switch 可配置选项
		* enable auth scope
		* */
		if ( isQuestion( comm ) ) {
			if ( !data ) {
				file[key] = {
					type: "question",
					enable: true,
					auth: comm.authLimit || dAuth,
					scope: comm.scope || dScope
				};
			} else {
				const enable: boolean = data.enable;
				if ( !enable ) {
					continue;
				}
				comm.authLimit = data.auth;
				comm.scope = data.scope;
			}
		}
		
		const mainPath: string = resolve( `${ ROOTPATH }/src/plugins/${ name }/${ comm.main }` );
		const { main } = require( mainPath );
		const command: Command = new Command( comm, main );
		
		commands.push( command );
	}
	
	writeYAML( "commands", file );
	return { name, commands };
}

export {
	addPlugin,
	loadPlugins
}