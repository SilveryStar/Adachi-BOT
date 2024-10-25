import {
	BasicConfig,
	CommandCfg,
	CommandFunc,
	CommonInit,
	FollowInfo,
	InputParameter,
	Unmatch
} from "../main";
import { BotConfig } from "@/modules/config";
import { scheduleJob, Job } from "node-schedule";
import bot from "ROOT";
import { escapeRegExp, trimStart } from "lodash";

export interface EnquireMatchResult {
	type: Enquire["type"];
	header: string;
	status: "activate" | "confirm" | "timeout" | "forceExit";
	timeout: number;
	forceExitCode: string[];
}

export type EnquireConfig = CommandCfg & {
	type: Enquire["type"];
	headers: string[];
	timeout: number;
	forceExitCode: string[];
};

export type EnquireInit = EnquireConfig & CommonInit & {
	run: CommandFunc<Enquire["type"]>;
};

interface RegPair {
	header: string;
	regExp: RegExp;
}

interface taskInfo {
	job: Job;
	header: string;
	input: InputParameter<"enquire">;
	inProgress: boolean; // 是否正在执行 confirm
}

export class Enquire extends BasicConfig {
	public readonly type = "enquire";
	public readonly run: CommandFunc<Enquire["type"]>;
	public readonly timeout: number;
	public readonly forceExitCode: string[];
	public readonly regPairs: RegPair[] = [];
	private readonly taskList: Record<string, taskInfo> = {};
	public static redisKey: string = "adachi.enquire-cmd";
	
	constructor( config: EnquireInit, botCfg: BotConfig ) {
		super( config, botCfg );
		
		this.run = config.run;
		this.timeout = config.timeout <= 0 ? 300 : config.timeout;
		this.forceExitCode = config.forceExitCode || [];
		
		const headers: string[] = config.headers.map( el => {
			if ( el.slice( 0, 2 ) === "__" ) {
				return trimStart( el, "_" );
			}
			return this.baseHeader.map( h => {
				return Enquire.header( el, h );
			} );
		} ).flat();
		
		this.regPairs = headers.map( header => {
			const pattern: string = Enquire.addStartStopChar(
				escapeRegExp( header ),
				config.start !== false,
				config.stop !== false
			);
			return {
				header,
				regExp: Enquire.regexp( pattern, this.ignoreCase, this.dotAll )
			}
		} );
	}
	
	public static read( cfg: EnquireInit, loaded ) {
		cfg.headers = loaded.headers;
		cfg.auth = loaded.auth;
		cfg.scope = loaded.scope;
		cfg.enable = loaded.enable;
		cfg.priority = Number.parseInt( loaded.priority ) || 0;
		cfg.forceExitCode = loaded.forceExitCode || [];
	}
	
	public write() {
		const cfg = <EnquireConfig>this.raw;
		return {
			type: this.type,
			auth: this.auth,
			scope: this.scope,
			headers: cfg.headers,
			enable: this.enable,
			display: this.display,
			priority: this.priority,
			forceExitCode: this.forceExitCode
		};
	}
	
	public match( content: string ): EnquireMatchResult | Unmatch {
		for ( const pair of this.regPairs ) {
			if ( pair.regExp.test( content ) ) {
				// 匹配成功
				return this.getMatchResult( pair.header, "activate" );
			}
		}
		// 匹配失败
		return { type: "unmatch", missParam: false };
	}
	
	/* 是否匹配退出指令 */
	public checkForceExitCode( content: string ) {
		return this.forceExitCode.includes( content );
	}
	
	private getActivateJob( userID: number, groupID: number, input: InputParameter<"enquire"> ) {
		const d = new Date();
		return scheduleJob( d.setSeconds( d.getSeconds() + this.timeout ), () => {
			bot.command.cmdRun( async () => {
				await this.inactivate( userID, groupID, input, "timeout" );
			}, userID, groupID );
		} )
	}
	
	public async activate( userID: number, groupID: number, input: InputParameter<"enquire"> ) {
		const key = Enquire.getTaskKey( userID, groupID );
		// 防抖
		if ( this.getTask( key ) ) return;
		Reflect.set( this.taskList, key, {
			job: null,
			header: input.matchResult.header,
			input,
			inProgress: false
		})
		input.matchResult.status = "activate";
		const completed = await this.run( input );
		// 直接中断执行
		if ( typeof completed === "boolean" && !completed ) {
			Reflect.deleteProperty( this.taskList, key );
			return;
		}
		
		Reflect.get( this.taskList, key ).job = this.getActivateJob( userID, groupID, input );
		await bot.redis.setHashField( Enquire.redisKey, key, this.cmdKey );
	};
	
	public async confirm( userID: number, groupID: number, input: Omit<InputParameter<"enquire">, "matchResult"> ) {
		const key = Enquire.getTaskKey( userID, groupID );
		const task = this.getTask( key );
		// 防抖
		if ( !task || task.inProgress ) return;
		task.inProgress = true;
		try {
			const matchResult = this.getMatchResult( task.header, "confirm" );
			const completed = await this.run( { ...input, matchResult } );
			if ( typeof completed === "boolean" && !completed ) {
				// 重置超时时间
				const task = Reflect.get( this.taskList, key );
				if ( task ) {
					task.job.cancel();
					task.job = this.getActivateJob( userID, groupID, task.input )
				}
				// 未执行完毕，不进行关闭
				return;
			}
			await this.inactivate( userID, groupID );
		} catch ( error ) {
			throw error;
		} finally {
			task.inProgress = false;
		}
	}
	
	public async inactivate(
		userID: number,
		groupID: number,
		input?: Omit<InputParameter<"enquire">, "matchResult"> & { matchResult?: EnquireMatchResult },
		type: "timeout" | "forceExit" = "timeout"
	) {
		const key = Enquire.getTaskKey( userID, groupID );
		await bot.redis.delHash( Enquire.redisKey, key );
		const task = this.getTask( key );
		if ( !task ) return;
		task.job.cancel();
		if ( input ) {
			const matchResult = this.getMatchResult( task.header, type );
			await this.run( { ...input, matchResult } );
		}
		Reflect.deleteProperty( this.taskList, key );
	};
	
	public static getTaskKey( userID: number, groupID: number ) {
		return `${ userID }-${ groupID }`;
	}
	
	public getTask( key: string ): taskInfo | undefined {
		return Reflect.get( this.taskList, key );
	}
	
	public getMatchResult( header: string, status: EnquireMatchResult["status"] ): EnquireMatchResult {
		return { type: this.type, header, status, timeout: this.timeout, forceExitCode: this.forceExitCode };
	}
	
	public getFollow(): FollowInfo {
		const headers = this.regPairs.map( el => el.header );
		const param = this.desc[1];
		return { headers, param };
	}
	
	public getDesc( headerNum?: number ): string {
		const { headers, param } = this.getFollow();
		const headerList = headerNum ? headers.slice( 0, headerNum ) : headers;
		const follow = `${ headerList.join( "|" ) } ${ param }`;
		return Enquire.addLineFeedChar(
			this.desc[0], follow,
			bot.config.directive.helpMessageStyle
		);
	}
	
	public getHeaders(): string[] {
		return this.regPairs.map( el => el.header );
	}
}