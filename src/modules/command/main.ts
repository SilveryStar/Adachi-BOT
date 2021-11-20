import * as cmd from "./index";
import FileManagement from "@modules/file";
import { Message, MessageScope, SendFunc } from "../message";
import { AuthLevel } from "../management/auth";
import { BOT } from "../bot";
import { trimStart, without } from "lodash";

type Optional<T> = {
	-readonly [ key in keyof T ]?: T[key];
};
type Required<T, K extends keyof T> = T & {
	[ key in K ]-?: T[key];
};

export interface Unmatch {
	type: "unmatch";
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
export type CommandInfo = Required<
	Optional<BasicConfig>,
	"cmdKey" | "desc"
> & { main?: string | CommandFunc };

export abstract class BasicConfig {
	readonly auth: AuthLevel;
	readonly scope: MessageScope;
	readonly cmdKey: string;
	readonly detail: string;
	readonly display: boolean;
	readonly ignoreCase: boolean;
	readonly raw: CommandInfo;
	readonly run: CommandFunc;
	readonly desc: [ string, string ];
	
	abstract match( content: string ): MatchResult;
	abstract write(): any;
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
	
	protected constructor( config: CommandInfo ) {
		this.cmdKey = config.cmdKey;
		this.desc = config.desc;
		this.auth = config.auth || AuthLevel.User;
		this.scope = config.scope || MessageScope.Both;
		this.detail = config.detail || "该指令暂无更多信息";
		this.ignoreCase = config.ignoreCase !== false;
		this.display = config.display !== false;
		this.run = <CommandFunc>config.run;
		
		this.raw = config;
	}
}

export default class Command {
	public privates: CommandList;
	public groups: CommandList;
	public cmdKeys: string[];
	
	constructor( file: FileManagement ) {
		this.privates = { [AuthLevel.Banned]: [], [AuthLevel.User]: [],
						  [AuthLevel.Master]: [], [AuthLevel.Manager]: [] };
		this.groups   = { [AuthLevel.Banned]: [], [AuthLevel.User]: [],
						  [AuthLevel.Master]: [], [AuthLevel.Manager]: [] };
		this.cmdKeys = without( Object.keys( file.loadYAML( "commands" ) ), "tips" );
	}
	
	public add( commands: BasicConfig[] ): void {
		commands.forEach( cmd => {
			for ( let auth = cmd.auth; auth <= AuthLevel.Master; auth++ ) {
				if ( cmd.scope & MessageScope.Group ) {
					this.groups[auth].push( cmd );
				}
				if ( cmd.scope & MessageScope.Private ) {
					this.privates[auth].push( cmd );
				}
			}
		} );
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