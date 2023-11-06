import * as cmd from "./index";
import { Enquire, Order, Switch } from "./index";
import bot from "ROOT";
import Plugin from "@/modules/plugin";
import FileManagement from "@/modules/file";
import { RefreshCatch } from "@/modules/management/refresh";
import * as msg from "@/modules/message";
import { Message, MessageScope, SendFunc } from "@/modules/message";
import { AuthLevel } from "../management/auth";
import { BOT } from "@/modules/bot";
import { trimStart, without } from "lodash";
import { BotConfig } from "@/modules/config";

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

export interface FollowInfo {
	headers: string[];
	param: string;
}

export type CommandType = Order | Switch | Enquire;

interface MatchResultMap {
	order: cmd.OrderMatchResult;
	switch: cmd.SwitchMatchResult;
	enquire: cmd.EnquireMatchResult;
}

export type InputParameter<T extends keyof MatchResultMap = any> = {
	sendMessage: SendFunc;
	messageData: Message;
	matchResult: MatchResultMap[T];
} & BOT;

export type CommandFunc<T extends keyof MatchResultMap> = ( input: InputParameter<T> ) => any;
export type CommandList = Record<AuthLevel, BasicConfig[]>;

/* 指令入口对象 */
export type CommandEntry = CommandFunc<"order"> | CommandFunc<"switch"> | CommandFunc<"enquire">;

/* 指令通用配置项 */
export interface CommandCfg {
	cmdKey: string;
	desc: [ string, string ];
	main?: string | CommandEntry;
	detail?: string;
	auth?: AuthLevel;
	scope?: MessageScope;
	display?: boolean;
	ignoreCase?: boolean;
	priority?: number;
	start?: boolean;
	stop?: boolean;
}

/* 指令配置项 */
export type ConfigType = cmd.OrderConfig |
	cmd.SwitchConfig |
	cmd.EnquireConfig;

/* 通用初始化指令对象 */
export interface CommonInit {
	pluginName: string;
	enable?: boolean;
}

export type InitType = cmd.OrderInit |
	cmd.SwitchInit |
	cmd.EnquireInit;

export type MatchResult = cmd.OrderMatchResult |
	cmd.SwitchMatchResult |
	cmd.EnquireMatchResult |
	Unmatch;

export const defineDirective = <T extends keyof MatchResultMap>( type: T, entry: CommandFunc<T> ) => entry;

export abstract class BasicConfig {
	abstract type: "order" | "switch" | "enquire";
	abstract run: CommandEntry;
	readonly auth: AuthLevel;
	readonly scope: MessageScope;
	readonly cmdKey: string;
	readonly detail: string;
	readonly display: boolean;
	readonly ignoreCase: boolean;
	readonly enable: boolean;
	readonly raw: ConfigType;
	readonly desc: [ string, string ];
	readonly pluginName: string;
	readonly priority: number;
	
	protected constructor(
		config: InitType,
		private botCfg: BotConfig
	) {
		this.pluginName = config.pluginName;
		this.cmdKey = config.cmdKey;
		this.desc = config.desc;
		this.auth = config.auth || AuthLevel.User;
		this.scope = config.scope || MessageScope.Both;
		this.detail = config.detail || "该指令暂无更多信息";
		this.ignoreCase = config.ignoreCase !== false;
		this.priority = config.priority || 0;
		this.display = config.display !== false;
		this.enable = config.enable !== false;
		this.raw = config;
	}
	
	abstract match( content: string ): MatchResult;
	
	abstract write(): any;
	
	abstract getFollow(): FollowInfo;
	
	abstract getDesc( headerNum?: number ): string;
	
	protected get baseHeader() {
		return this.botCfg.directive.header.length
			? Array.from( new Set( this.botCfg.directive.header  ) )
			: [ "" ];
	}

	// 非捕获正则字符串中的分组，并捕获整段参数
	protected captureParams( regList: string[] ) {
		return regList.map( r => {
			const fr = r.replace( /\((.+?)\)/g, "(?:$1)" );
			return `(${ fr })`;
		} );
	}
	
	protected static header( raw: string, h: string ): string {
		if ( raw.slice( 0, 2 ) === "__" ) {
			return trimStart( raw, "_" );
		} else {
			return h + raw;
		}
	}
	
	protected static regexp( regStr: string, i: boolean = false ): RegExp {
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
}

export default class Command {
	private privates: CommandList = Command.initAuthObject();
	private groups: CommandList = Command.initAuthObject();
	private all: CommandList = Command.initAuthObject();
	private pUnionReg: Record<AuthLevel, RegExp> = Command.initAuthObject();
	private gUnionReg: Record<AuthLevel, RegExp> = Command.initAuthObject();
	public raws: ConfigType[] = [];
	public readonly cmdKeys: string[];
	
	constructor( file: FileManagement ) {
		this.cmdKeys = without( Object.keys( ( file.loadYAMLSync( "commands" ) || {} ) ), "tips" );
	}
	
	private static initAuthObject(): Record<AuthLevel, any> {
		return {
			[AuthLevel.Banned]: [], [AuthLevel.User]: [],
			[AuthLevel.Master]: [], [AuthLevel.Manager]: []
		};
	}
	
	public async refresh(): Promise<string> {
		try {
			await this.reload();
			return "指令配置重新加载完毕";
		} catch ( error ) {
			throw <RefreshCatch>{
				log: ( <Error>error ).stack,
				msg: "指令配置重新加载失败，请前往控制台查看日志"
			};
		}
	}
	
	public async reload() {
		this.privates = Command.initAuthObject();
		this.groups = Command.initAuthObject();
		this.all = Command.initAuthObject();
		this.pUnionReg = Command.initAuthObject();
		this.gUnionReg = Command.initAuthObject();
		
		const pluginInstance = Plugin.getInstance();
		const commandConfig: Record<string, any> = await bot.file.loadYAML( "commands" ) || {};
		// 要写入的 command.yml 配置文件内容
		let cmdConfig: Record<string, any> = {};
		
		const pluginList = Object.values( pluginInstance.pluginList ).sort( ( prev, next ) => {
			return prev.sortIndex - next.sortIndex;
		} );
		for ( const pluginInfo of pluginList ) {
			const cmdConfigItem = await pluginInstance.parse( pluginInfo.key, commandConfig );
			this.add( pluginInfo.commands );
			cmdConfig = { ...cmdConfig, ...cmdConfigItem };
		}
		await bot.file.writeYAML( "commands", cmdConfig );
	}
	
	private add( commands: BasicConfig[] ): void {
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
				this.all[auth].push( cmd );
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
						list.push( ...el.genRegExps.map( r => `(${ r.source })` ) );
						
						const unMatchHeader = cmd.getExtReg( el );
						if ( unMatchHeader ) {
							list.push( `(${ unMatchHeader })` );
						}
					} );
				} else if ( cmd.type === "switch" ) {
					cmd.regPairs.forEach( el => {
						list.push( ...el.genRegExps.map( r => `(${ r.source })` ) );
					} );
				} else if ( cmd.type === "enquire" ) {
					list.push( ...cmd.regPairs.map( r => `(${ r.regExp.source })` ) );
				}
			} )
			return new RegExp( `(${ list.join( "|" ) })`, "i" );
		}
	}
	
	public getUnion( auth: AuthLevel, scope: MessageScope.Group | MessageScope.Private ): RegExp {
		if ( scope === MessageScope.Private ) {
			return this.pUnionReg[auth];
		} else {
			return this.gUnionReg[auth];
		}
	}
	
	public get( auth: AuthLevel, scope: MessageScope ): BasicConfig[] {
		if ( scope === MessageScope.Private ) {
			return this.privates[auth];
		} else if ( scope === MessageScope.Group ) {
			return this.groups[auth];
		} else {
			return this.all[auth];
		}
	}
	
	public async cmdRunError( run: ( ...arg: any[] ) => any, userID: number, groupID: number ) {
		const sendMessage = groupID === -1
			? bot.message.getSendMessageFunc( userID, msg.MessageType.Private )
			: bot.message.getSendMessageFunc( userID, msg.MessageType.Group, groupID );
		try {
			await run();
		} catch ( error ) {
			bot.logger.error( ( <Error>error ).stack || error );
			const CALL = <Order>bot.command.getSingle( "adachi.call", await bot.auth.get( userID ) );
			const appendMsg = CALL ? `私聊使用 ${ CALL.getHeaders()[0] } ` : "";
			await sendMessage( `指令执行异常，请${ appendMsg }联系持有者进行反馈` );
		}
	}
	
	public getSingle(
		key: string,
		auth: AuthLevel = AuthLevel.User,
		scope: MessageScope = MessageScope.Both
	): BasicConfig | undefined {
		const commandsMap = {
			[ MessageScope.Private ]: this.privates,
			[ MessageScope.Group ]: this.groups,
			[ MessageScope.Both ]: this.all
		}
		const commands: BasicConfig[] = commandsMap[scope]?.[auth];
		if ( !commands ) {
			return;
		}
		return commands.find( el => el.cmdKey == key );
	}
	
	public checkOrder( cmd: BasicConfig ): cmd is Order {
		return cmd.type === "order";
	}
	
	public checkSwitch( cmd: BasicConfig ): cmd is Switch {
		return cmd.type === "switch";
	}
	
	public checkEnquire( cmd: BasicConfig ): cmd is Enquire {
		return cmd.type === "enquire";
	}
}