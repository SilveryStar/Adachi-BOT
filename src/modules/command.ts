import { botConfig } from "../bot";
import { CommonMessageEventData as Message } from "oicq";
import { MessageScope, sendType } from "./message";
import { AuthLevel, checkAuthLevel } from "./auth";
import { escapeRegExp, trimStart } from "lodash"

interface CommandMethod {
	getKeysInfo(): string;
	match( message: string ): CommandMatchResult;
	checkAuth( id: number, auth: AuthLevel ): Promise<boolean>;
}

/**
 * @interface
 * @enable 无需配置，仅用于用户配置文件写入
 * */
export interface CommandConfig {
	commandType: "order" | "switch" | "question";
	key: string;
	docs: string[];
	authLimit?: AuthLevel;
	scope?: MessageScope;
	main?: string;
	detail?: string;
	display?: boolean;
	start?: boolean;
	end?: boolean;
	enable?: boolean;
}

interface Order extends CommandConfig {
	commandType: "order";
	headers: string[];
	regexps: string[] | string[][];
}

interface Switch extends CommandConfig {
	commandType: "switch";
	mode: "single" | "divided";
	header: string;
	regexp: string | string[];
	onKeyword: string;
	offKeyword: string;
}

interface Question extends CommandConfig {
	commandType: "question";
	sentences: string[];
}

export type CommandType = Order | Switch | Question;

export function isOrder( data: CommandConfig ): data is Order {
	return data.commandType === "order";
}

export function isSwitch( data: CommandConfig ): data is Switch {
	return data.commandType === "switch";
}

export function isQuestion( data: CommandConfig ): data is Question {
	return data.commandType === "question";
}

export interface SwitchMatch {
	type: "switch";
	switch: string;
	match: string[];
	isOn: () => boolean;
}

export interface OrderMatch {
	type: "order";
	header: string;
}

export interface QuestionMatch {
	type: "question";
	list: string[];
}

export interface Unmatch {
	type: "unmatch";
}

export type CommandMatchResult = OrderMatch | SwitchMatch | QuestionMatch | Unmatch;
type mainFunc = ( sendMessage: sendType, message: Message, match: CommandMatchResult ) => void | Promise<void>;

export class Command implements CommandMethod {
	private readonly type: string;
	private readonly headers: string[] = [];
	private readonly regexps: RegExp[] = [];
	private readonly rawConfig: CommandType;
	private readonly startCharacter: boolean;
	private readonly endCharacter: boolean;
	
	public readonly key: string;
	public readonly docs: string;
	public readonly desc: string;
	public readonly detail: string;
	public readonly display: boolean;
	public readonly scope: MessageScope;
	public readonly authLimit: AuthLevel;
	public readonly run: mainFunc
	
	constructor( config: CommandType, main: mainFunc ) {
		this.run = main;
		this.key = config.key;
		this.type = config.commandType;
		this.rawConfig = config;
		
		this.detail = config.detail || "该指令暂无更多信息";
		this.scope = config.scope || MessageScope.Both;
		this.authLimit = config.authLimit || AuthLevel.User;
		this.display = config.display !== false;
		this.startCharacter = config.start !== false;
		this.endCharacter = config.end !== false;
		
		if ( isOrder( config ) ) {
			for ( let header of config.headers ) {
				this.headers.push( Command.modifyHeader( header ) );
			}
			
			let rawRegs = config.regexps;
			const isDeep: boolean = config.regexps.some( el => el instanceof Array );
			if ( !isDeep ) {
				rawRegs = [ rawRegs as string[] ];
				( this.rawConfig as Order ).regexps = rawRegs;
			}
			
			for ( let header of this.headers ) {
				for ( let reg of rawRegs as string[][] ) {
					const r: string = [ "", ...reg ].join( " *" );
					const h: string = escapeRegExp( header );
					this.regexps.push( new RegExp( this.addStartStopCharacter( h + r ) ) );
				}
			}
		}

		if ( isSwitch( config ) ) {
			const process: ( h: string ) => string = h => escapeRegExp( Command.modifyHeader( h ) );
			
			if ( config.mode === "single" ) {
				let reg: string = config.regexp instanceof Array
								? [ "", ...config.regexp ].join( " *" )
								: config.regexp;
				
				const h: string = process( config.header );
				const r: string = reg.replace( "${OPT}", `(${ config.onKeyword }|${ config.offKeyword })` );
				this.headers.push( h );
				this.regexps.push( new RegExp( this.addStartStopCharacter( h + r ) ) );
			} else {
				const r: string = config.regexp instanceof Array
								? [ "", ...config.regexp.filter( el => el !== "${OPT}" ) ].join( " *" )
								: config.regexp.replace( " ${OPT}", "" );
				const h1: string = process( config.onKeyword );
				const h2: string = process( config.offKeyword );
				this.headers.push( h1, h2 );
				this.regexps.push( new RegExp( this.addStartStopCharacter( `(${ h1 }|${ h2 })${ r }` ) ) );
			}
		}
		
		if ( isQuestion( config ) ) {
			for ( let sentence of config.sentences ) {
				sentence = sentence.replace( "${HEADER}", escapeRegExp( botConfig.header ) );
				this.regexps.push( new RegExp( sentence ) );
			}
		}
		
		/* 最后处理描述信息 */
		this.docs = this.parseDocs();
		this.desc = config.docs[0];
	}
	
	static modifyHeader( raw: string ): string {
		if ( raw.substr( 0, 2 ) === "__" ) {
			return trimStart( raw, "_" );
		} else {
			return botConfig.header + raw;
		}
	}
	
	private addStartStopCharacter( raw: string ): string {
		return ( this.startCharacter ? "^" : "" ) + raw + ( this.endCharacter ? "$" : "" );
	}
	
	private parseDocs(): string {
		const info: string = this.rawConfig.docs[0] + " ";
		
		function getLength( str: string ): number {
			return str.replace( /[\u0391-\uFFE5]/g, "aa" ).length;
		}
		
		function getCharacter( str: string ): string {
			if ( botConfig.helpMessageStyle === "xml" && getLength( str ) > 30 ) {
				return "\n";
			}
			return "";
		}
		
		let cmd: string = "";
		if ( isOrder( this.rawConfig ) ) {
			for ( let i = 0; i < this.headers.length; i++ ) {
				if ( i !== 0 ) {
					cmd += "|";
				}
				cmd += this.headers[i];
			}
			if ( this.rawConfig.docs[1] !== "" ) {
				cmd += " " + this.rawConfig.docs[1];
			}
		} else if ( isSwitch( this.rawConfig ) ) {
			if ( this.rawConfig.mode === "single" ) {
				const s: string = `[${ this.rawConfig.onKeyword }|${ this.rawConfig.offKeyword }]`
				cmd += this.headers[0] + " ";
				cmd += this.rawConfig.docs[1].replace( "${OPT}", s );
			} else {
				cmd += `${ this.headers[0] }|${ this.headers[1] } `;
				cmd += this.rawConfig.docs[1]
						   .replace( /\${OPT}/, "" )
						   .trim()
						   .replace( /\s+/g, " " );
			}
		} else if ( isQuestion( this.rawConfig ) ) {
			cmd += "发送:" + this.rawConfig.docs[1];
		}
		
		return info + getCharacter( info + cmd ) + cmd;
	}
	
	public getKeysInfo(): string {
		return `${ this.desc } -- ${ this.key }`
	}
	
	public getHeaders(): string[] {
		return this.headers;
	}
	
	public match( message: string ): CommandMatchResult {
		let data: any = {};
		if ( isOrder( this.rawConfig ) ) {
			const regexpNum: number = this.regexps.length;
			const rawRegNum: number = this.rawConfig.regexps.length;
			
			data.type = "order";
			
			for ( let i = 0; i < regexpNum; i++ ) {
				if ( this.regexps[i].test( message ) ) {
					data.header = this.headers[ Math.floor( i / rawRegNum ) ];
					return data;
				}
			}
		} else if ( isSwitch( this.rawConfig ) ) {
			data.type = "switch";
			
			for ( let regexp of this.regexps ) {
				const res: RegExpExecArray | null = regexp.exec( message );
				if ( res === null ) {
					continue;
				}
				
				let onKeyword: string = "";
				let offKeyword: string = "";
				if ( this.rawConfig.mode === "single" ) {
					onKeyword = this.rawConfig.onKeyword;
					offKeyword = this.rawConfig.offKeyword;
				} else if ( this.rawConfig.mode === "divided" ) {
					onKeyword = this.headers[0];
					offKeyword = this.headers[1];
				}
				
				const tmp: string[] = res.splice( 1 );
				if ( tmp.includes( onKeyword ) ) {
					data.switch = onKeyword;
				}
				if ( tmp.includes( offKeyword ) ) {
					data.switch = offKeyword;
				}

				data.isOn = () => data.switch === onKeyword;
				data.match = res[0].replace( / +/g, " " )
								   .split( " " )
								   .filter( el => el !== data.switch )
								   .map( el => trimStart( el ) );
				if ( this.rawConfig.mode === "single" ) {
					data.match.shift();
				}
				
				return data;
			}
		} else if ( isQuestion( this.rawConfig ) ) {
			data.type = "question";
			
			for ( let regexp of this.regexps ) {
				const res: RegExpExecArray | null = regexp.exec( message );
				if ( res !== null ) {
					data.list = res.splice( 1 );
					return data;
				}
			}
		}
		
		return { type: "unmatch" };
	}
	
	public compare(): number {
		return this.type !== "question" ? 0 : 1;
	}
	
	public async checkAuth( userID: number ): Promise<boolean> {
		return await checkAuthLevel( userID, this.authLimit );
	}
}