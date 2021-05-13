import { AuthLevel } from "./auth";
import { MessageAllow } from "./message";
import { CommonMessageEventData as Message } from "oicq";

let id = 0;

interface CommandConfig {
	docs: string;
	regexp: string[];
	authLimit: AuthLevel;
	main?: string;
	detail?: string;
}

class Plugin {
	public id: number;
	
	private readonly authLimit: AuthLevel;
	private readonly regexp: RegExp[];
	private readonly docs: string;
	
	public run: ( message: Message, sendMessage: ( content: string ) => any ) => void;
	
	constructor(
		id: number, auth: AuthLevel, docs: string, regList: string[],
		main: ( message: Message, sendMessage: ( content: string ) => any ) => void
	) {
		this.id = id;
		this.docs = docs;
		this.run = main;
		this.authLimit = auth;
		this.regexp = <Array<RegExp>>[];
		for ( let r of regList ) {
			this.regexp.push( new RegExp( r ) );
		}
	}
	
	public getDocs(): string {
		return this.docs;
	}
	
	public match( message: string ): boolean {
		for ( let i in this.regexp ) {
			if ( this.regexp[i].test( message ) ) {
				return true;
			}
		}
		return false
	}
	
	public checkAuth( userAuthLevel: AuthLevel ): boolean {
		return this.authLimit > userAuthLevel;
	}
}

class Event {

}

declare function require( moduleName: string ): any;

function addPlugin( name: string, allow: MessageAllow, ...commandList: CommandConfig[] ): { type: MessageAllow, plugins: Plugin[] } {
	let plugins = <Array<Plugin>>[];
	
	for ( let command of commandList ) {
		if ( command.main === undefined ) {
			command.main = "index";
		}
		if ( command.detail === undefined ) {
			command.detail = "该命令暂无更多信息";
		}
		
		let { main } = require( `../plugins/${ name }/${ command.main }` );
		let plugin = new Plugin( ++id, command.authLimit, command.docs, command.regexp, main );
		plugins.push( plugin );
	}
	
	return { type: allow, plugins };
}

function addEvent(): void {
	
}

export {
	CommandConfig,
	Plugin,
	addPlugin,
	Event,
	addEvent
}