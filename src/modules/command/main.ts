import * as cmd from "./index";
import bot from "ROOT";
import Plugin, { PluginRawConfigs } from "@modules/plugin";
import FileManagement from "@modules/file";
import { RefreshCatch } from "@modules/management/refresh";
import { Message, MessageScope, SendFunc } from "../message";
import { Enquire, Order, Switch } from "./index";
import { AuthLevel } from "../management/auth";
import { BOT } from "../bot";
import { trimStart, without } from "lodash";

type Optional<T> = {
	-readonly [key in keyof T]?: T[key];
};
type Required<T, K extends keyof T> = T & {
	[key in K]-?: T[key];
};

export interface Unmatch {
	type: "unmatch";
	missParam: boolean;
	header?: string;
	param?: string;
}

export type MatchResult = cmd.OrderMatchResult |
	cmd.SwitchMatchResult |
	cmd.EnquireMatchResult |
	Unmatch;

export type ConfigType = cmd.OrderConfig |
	cmd.SwitchConfig |
	cmd.EnquireConfig;

export type InputParameter = {
	sendMessage: SendFunc;
	messageData: Message;
	matchResult: MatchResult;
} & BOT;

export type CommandFunc = ( input: InputParameter ) => void | Promise<void>;
export type CommandList = Record<AuthLevel, BasicConfig[]>;
export type CommandInfo = Required<Optional<BasicConfig>,
	"cmdKey" | "desc"> & { main?: string | CommandFunc };
export type CommandType = Order | Switch | Enquire;

export abstract class BasicConfig {
	readonly auth: AuthLevel;
	readonly scope: MessageScope;
	readonly cmdKey: string;
	readonly detail: string;
	readonly display: boolean;
	readonly ignoreCase: boolean;
	readonly raw: ConfigType;
	readonly run: CommandFunc;
	readonly desc: [ string, string ];
	readonly pluginName: string;
	
	abstract match( content: string ): MatchResult;
	
	abstract write(): any;
	
	abstract getFollow(): string;
	
	abstract getDesc(): string;
	
	protected static header( raw: string, h: string ): string {
		if ( raw.substr( 0, 2 ) === "__" ) {
			return trimStart( raw, "_" );
		} else {
			return h + raw;
		}
	}
	
	protected static regexp( regStr: string, i: boolean ): RegExp {
		return new RegExp( regStr, i ? "i" : "" );
	}
	
	protected static addStartStopChar(
		raw: string,
		start: boolean, stop: boolean
	): string {
		return `${ start ? "^" : "" }${ raw }${ stop ? "$" : "" }`;
	}
	
	protected static addLineFeedChar(
		front: string, follow: string,
		helpStyle: string
	): string {
		const length: number = ( front + follow ).replace(
			/[\u0391-\uFFE5]/g, "aa"
		).length;
		
		if ( helpStyle === "xml" && length > 30 ) {
			return front + "\n" + follow;
		}
		return front + " " + follow;
	}
	
	public getCmdKey(): string {
		const [ func ] = this.desc;
		return `${ func } -- ${ this.cmdKey }`;
	}
	
	protected constructor( config: ConfigType, pluginName: string ) {
		this.cmdKey = config.cmdKey;
		this.desc = config.desc;
		this.auth = config.auth || AuthLevel.User;
		this.scope = config.scope || MessageScope.Both;
		this.detail = config.detail || "该指令暂无更多信息";
		this.ignoreCase = config.ignoreCase !== false;
		this.display = config.display !== false;
		this.run = <CommandFunc>config.run;
		this.pluginName = pluginName;
		
		this.raw = config;
	}
}

export default class Command {
	public privates: CommandList;
	public groups: CommandList;
	public pUnionReg: Record<AuthLevel, RegExp>;
	public gUnionReg: Record<AuthLevel, RegExp>;
	public raws: ConfigType[] = [];
	public readonly cmdKeys: string[];
	
	constructor( file: FileManagement ) {
		this.privates = Command.initAuthObject();
		this.groups = Command.initAuthObject();
		this.pUnionReg = Command.initAuthObject();
		this.gUnionReg = Command.initAuthObject();
		
		this.cmdKeys = without( Object.keys( file.loadYAML( "commands" ) ), "tips" );
	}
	
	private static initAuthObject(): Record<AuthLevel, any> {
		return {
			[AuthLevel.Banned]: [], [AuthLevel.User]: [],
			[AuthLevel.Master]: [], [AuthLevel.Manager]: []
		};
	}
	
	public async refresh(): Promise<string> {
		try {
			this.privates = Command.initAuthObject();
			this.groups = Command.initAuthObject();
			this.pUnionReg = Command.initAuthObject();
			this.gUnionReg = Command.initAuthObject();
			
			const commands: BasicConfig[] = [];
			for ( let name of Object.keys( PluginRawConfigs ) ) {
				const raws: ConfigType[] = PluginRawConfigs[name];
				const cmd: BasicConfig[] = Plugin.parse( bot, raws, name );
				commands.push( ...cmd );
			}
			this.add( commands );
			return "指令配置重新加载完毕";
		} catch ( error ) {
			throw <RefreshCatch>{
				log: ( <Error>error ).stack,
				msg: "指令配置重新加载失败，请前往控制台查看日志"
			};
		}
	}
	
	public add( commands: BasicConfig[] ): void {
		this.raws = [];
		commands.forEach( cmd => {
			this.raws.push( cmd.raw );
			for ( let auth = cmd.auth; auth <= AuthLevel.Master; auth++ ) {
				if ( cmd.scope & MessageScope.Group ) {
					this.groups[auth].push( cmd );
				}
				if ( cmd.scope & MessageScope.Private ) {
					this.privates[auth].push( cmd );
				}
			}
		} );
		
		for ( let auth = AuthLevel.Banned; auth <= AuthLevel.Master; auth++ ) {
			this.pUnionReg[auth] = convertAllRegToUnion( <CommandType[]>this.privates[auth] );
			this.gUnionReg[auth] = convertAllRegToUnion( <CommandType[]>this.groups[auth] );
		}
		
		function convertAllRegToUnion( cmdSet: CommandType[] ): RegExp {
			const list: string[] = [];
			cmdSet.forEach( cmd => {
				if ( cmd.type === "order" ) {
					cmd.regPairs.forEach( el => {
						list.push(
							...el.genRegExps.map( r => `(${ r.source })` )
						);
						
						/* 是否存在指令起始符 */
						const hasHeader = bot.config.header ? el.header.includes( bot.config.header ) : false;
						const rawHeader = el.header.replace( bot.config.header, "" );
						
						let unMatchHeader: string = "";
						
						if ( bot.config.fuzzyMatch && rawHeader.length !== 0 && /[\u4e00-\u9fa5]/.test( rawHeader ) ) {
							/* 当开启模糊匹配、指令头包括中文时，同时匹配是否存在起始符与指令头 */
							unMatchHeader = `${ hasHeader ? "(?=^" + bot.config.header + ")" : "" }(?=.*${ rawHeader })`
						} else if ( bot.config.matchPrompt && bot.config.header && el.header ) {
							/* 当开启格式检查提示、存在起始符时，添加指令头至unionReg */
							unMatchHeader = "^" + el.header;
						}
						
						if ( unMatchHeader.length === 0 ) {
							return;
						}
						
						list.push( `(${ unMatchHeader })` );
					} );
				} else if ( cmd.type === "switch" ) {
					list.push( ...cmd.regexps.map( r => `(${ r.source })` ) );
				} else if ( cmd.type === "enquire" ) {
					list.push( ...cmd.sentences.map( s => `(${ s.reg.source })` ) );
				}
			} )
			return new RegExp( `(${ list.join( "|" ) })`, "i" );
		}
	}
	
	public getUnion( auth: AuthLevel, scope: MessageScope ): RegExp {
		if ( scope === MessageScope.Private ) {
			return this.pUnionReg[auth];
		} else {
			return this.gUnionReg[auth];
		}
	}
	
	public get( auth: AuthLevel, scope: MessageScope ): BasicConfig[] {
		if ( scope === MessageScope.Private ) {
			return this.privates[auth];
		} else {
			return this.groups[auth];
		}
	}
	
	public getSingle(
		key: string,
		level: AuthLevel = AuthLevel.User,
		type: string = "privates"
	): BasicConfig | undefined {
		const commands: BasicConfig[] = this[type][level];
		return commands.find( el => el.cmdKey == key );
	}
}