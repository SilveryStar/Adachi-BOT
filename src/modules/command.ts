import { botConfig } from "../bot";
import { CommonMessageEventData as Message } from "oicq";
import { MessageScope, removeStringPrefix } from "./message";
import { AuthLevel, checkAuthLevel } from "./auth";

interface CommandMethod {
	getDocsInfo(): string
	getKeysInfo(): string
	match( message: string ): string | string[]
	checkAuth( id: number, auth: AuthLevel ): Promise<boolean>
}

interface CommandConfig {
	commandType: "order" | "question";
	key: string;
	docs: string[];
	authLimit?: AuthLevel;
	scope?: MessageScope;
	main?: string;
	detail?: string;
	display?: boolean;
}

interface Order extends CommandConfig {
	commandType: "order";
	headers: string[];
	regexps: string[];
}

interface Question extends CommandConfig {
	commandType: "question";
	sentences: string[];
}

function isOrder( data: CommandConfig ): data is Order {
	return data.commandType === "order";
}

function isQuestion( data: CommandConfig ): data is Question {
	return data.commandType === "question";
}

export class Command implements CommandMethod {
	private readonly type: string;
	private readonly regexps: RegExp[];
	private readonly docs: string[];
	private readonly headers: string[];
	
	public readonly key: string;
	public readonly detail: string;
	public readonly display: boolean;
	public readonly scope: MessageScope;
	public readonly authLimit: AuthLevel;
	public readonly run: ( sendMessage: ( content: string ) => any, message: Message, match: string | string[] ) => void | Promise<void>;
	
	constructor(
		config: CommandConfig,
		main: ( sendMessage: ( content: string ) => any, message: Message, match: string | string[] ) => void | Promise<void>
	) {
		this.run = main;
		this.key = config.key;
		this.docs = config.docs;
		this.type = config.commandType;
		this.headers = <Array<string>>[];
		this.regexps = <Array<RegExp>>[];
		
		this.detail = config.detail === undefined ? "该指令暂无更多信息" : config.detail;
		this.scope = config.scope === undefined ? MessageScope.Both : config.scope;
		this.authLimit = config.authLimit === undefined ? AuthLevel.User : config.authLimit;
		this.display = config.display === undefined ? true : config.display;
		
		if ( isOrder( config ) ) {
			for ( let header of config.headers ) {
				this.headers.push( Command.modifyHeader( header ) );
			}
			for ( let header of this.headers ) {
				for ( let reg of config.regexps ) {
					this.regexps.push( new RegExp( header + reg ) );
				}
			}
		}
		if ( isQuestion( config ) ) {
			for ( let sentence of config.sentences ) {
				this.regexps.push( new RegExp( sentence ) );
			}
		}
	}
	
	static modifyHeader( rawConfig: string ): string {
		if ( rawConfig[0] === "_" && rawConfig[1] === "_" ) {
			return removeStringPrefix( rawConfig, "__" );
		} else {
			return botConfig.header + rawConfig;
		}
	}
	
	public getDocsInfo(): string {
		let info = this.docs[0] + " ";
		
		for ( let i = 0; i < this.headers.length; i++ ) {
			if ( i !== 0 ) {
				info += "|";
			}
			info += this.headers[i];
		}
		if ( this.type === "order" && this.docs[1] !== "" ) {
			info += " " + this.docs[1];
		}
		if ( this.type === "question" ) {
			info += "发送:" + this.docs[1];
		}
		
		return info;
	}
	
	public getKeysInfo(): string {
		return `${ this.docs[0] } -- ${ this.key }`
	}
	
	public match( message: string ): string | string[] {
		if ( this.type === "order" ) {
			for ( let i = 0; i < this.regexps.length; i++ ) {
				if ( this.regexps[i].test( message ) ) {
					return this.headers[i];
				}
			}
			return "";
		} else {
			for ( let regexp of this.regexps ) {
				const result: RegExpExecArray | null = regexp.exec( message );
				if ( result !== null ) {
					return result.splice( 1 );
				}
			}
			return [];
		}
	}
	
	public compare(): number {
		return this.type === "order" ? 0 : 1;
	}
	
	public async checkAuth( userID: number ): Promise<boolean> {
		return await checkAuthLevel( userID, this.authLimit );
	}
}

export {
	Order,
	Question,
	CommandConfig,
	isOrder
}