import { Adachi, groupCommands, privateCommands } from "../bot";
import { ROOTPATH } from "../../app";
import { readdirSync } from "fs";
import { loadYAML, writeYAML } from "../utils/config";
import { resolve } from "path";
import { Command, isOrder, Order, Question } from "./command";
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

function addPlugin( name: string, ...commandList: ( Order | Question )[] ): { name: string, commands: Command[] } {
	let commands: Command[] = [];
	const commandFile: object = loadYAML( "commands" );
	
	for ( let comm of commandList ) {
		comm.main = comm.main || "index";
		
		if ( isOrder( comm ) ) {
			if ( commandFile[comm.key] ) {
				comm.headers = commandFile[comm.key];
			} else {
				commandFile[comm.key] = comm.headers;
			}
			if ( commandFile[comm.key].length === 0 ) {
				continue;
			}
		}
		
		const mainPath: string = resolve( `${ ROOTPATH }/src/plugins/${ name }/${ comm.main }` );
		const { main } = require( mainPath );
		const command: Command = new Command( comm, main );
		
		commands.push( command );
	}
	
	writeYAML( "commands", commandFile );
	return { name, commands };
}

export {
	addPlugin,
	loadPlugins
}