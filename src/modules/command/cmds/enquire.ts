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
	status: "activate" | "confirm" | "timeout";
	timeout: number;
}

export type EnquireConfig = CommandCfg & {
	type: Enquire["type"];
	headers: string[];
	timeout: number;
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
}

export class Enquire extends BasicConfig {
	public readonly type = "enquire";
	public readonly run: CommandFunc<Enquire["type"]>;
	public readonly timeout: number;
	public readonly regPairs: RegPair[] = [];
	private readonly taskList: Record<string, taskInfo> = {};
	public static redisKey: string = "adachi.enquire-cmd";
	
	constructor( config: EnquireInit, botCfg: BotConfig ) {
		super( config );
		
		this.run = config.run;
		this.timeout = config.timeout <= 0 ? 300 : config.timeout;
		
		const headers: string[] = config.headers.map( el => {
			if ( el.slice( 0, 2 ) === "__" ) {
				return trimStart( el, "_" );
			}
			return botCfg.directive.header.map( h => {
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
				regExp: Enquire.regexp( pattern, this.ignoreCase )
			}
		} );
	}
	
	public static read( cfg: EnquireInit, loaded ) {
		cfg.headers = loaded.headers;
		cfg.auth = loaded.auth;
		cfg.scope = loaded.scope;
		cfg.enable = loaded.enable;
		cfg.priority = Number.parseInt( loaded.priority ) || 0;
	}
	
	public write() {
		const cfg = <EnquireConfig>this.raw;
		return {
			type: this.type,
			auth: this.auth,
			scope: this.scope,
			headers: cfg.headers,
			enable: this.enable,
			priority: this.priority
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
	
	public async activate( userID: number, groupID: number, input: InputParameter<"enquire"> ) {
		const d = new Date();
		const key = Enquire.getTaskKey( userID, groupID );
		Reflect.set( this.taskList, key, {
			job: scheduleJob( d.setSeconds( d.getSeconds() + this.timeout ), async () => {
				input.matchResult.status = "timeout";
				await bot.command.cmdRunError( async () => {
					await this.inactivate( userID, groupID, input );
				}, userID, groupID );
			} ),
			header: input.matchResult.header
		} );
		await bot.redis.setHashField( Enquire.redisKey, key, this.cmdKey );
		input.matchResult.status = "activate";
		await this.run( input );
	};
	
	public async confirm( userID: number, groupID: number, input: Omit<InputParameter<"enquire">, "matchResult"> ) {
		const key = Enquire.getTaskKey( userID, groupID );
		const task = this.getTask( key );
		const matchResult = this.getMatchResult( task.header, "confirm" );
		const completed = await this.run( { ...input, matchResult } );
		if ( typeof completed === "boolean" && !completed ) {
			// 未执行完毕，不进行关闭
			return;
		}
		await this.inactivate( userID, groupID );
	}
	
	public async inactivate( userID: number, groupID: number, input?: InputParameter<"enquire"> ) {
		const key = Enquire.getTaskKey( userID, groupID );
		this.getTask( key ).job.cancel();
		Reflect.deleteProperty( this.taskList, key );
		await bot.redis.delHash( Enquire.redisKey, key );
		if ( input?.matchResult.status === "timeout" ) {
			await this.run( input );
		}
	};
	
	public static getTaskKey( userID: number, groupID: number ) {
		return `${ userID }-${ groupID }`;
	}
	
	public getTask( key: string ) {
		return Reflect.get( this.taskList, key );
	}
	
	private getMatchResult( header: string, status: EnquireMatchResult["status"] ): EnquireMatchResult {
		return { type: this.type, header, status, timeout: this.timeout };
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