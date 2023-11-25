import { BasicConfig, CommandCfg, CommandFunc, CommonInit, FollowInfo, Unmatch } from "../main";
import { BotConfig } from "@/modules/config";
import bot from "ROOT";
import { escapeRegExp } from "lodash";

export interface SwitchMatchResult {
	type: Switch["type"];
	header: string;
	switch: string;
	match: string[];
	isOn: boolean;
}

export type SwitchConfig = CommandCfg & {
	type: Switch["type"];
	mode: "single" | "divided";
	onKey: string;
	offKey: string;
	header: string;
	regexps: string[] | string[][];
};

export type SwitchInit = SwitchConfig & CommonInit & {
	run: CommandFunc<Switch["type"]>;
};

interface RegPair {
	header: string;
	genRegExps: RegExp[];
}

export class Switch extends BasicConfig {
	public readonly type = "switch";
	private readonly mode: "single" | "divided";
	public readonly regPairs: RegPair[] = [];
	public readonly run: CommandFunc<Switch["type"]>;
	private readonly keys: [ string, string ] | [ string, string ][];
	
	constructor( config: SwitchInit, botCfg: BotConfig ) {
		super( config, botCfg );
		
		this.mode = config.mode;
		this.run = config.run;
		this.keys = config.mode === "single" ? [ config.onKey, config.offKey ] : [];
		
		if ( config.onKey === config.offKey ) {
			throw `指令 ${ config.cmdKey } 配置错误: onKey 与 offKey 不可相同`;
		}
		if ( config.offKey.length === 0 || config.onKey.length === 0 ) {
			throw `指令 ${ config.cmdKey } 配置错误: onKey 和 offKey 不可为空`;
		}
		
		const addChar: ( s: string ) => string = s => Switch.addStartStopChar(
			s, config.start !== false, config.stop !== false
		);

		const regParam = this.checkRegexps( config.regexps ) ? config.regexps : [ config.regexps ];
		this.regPairs = this.baseHeader.map( header => {
			const getHeaderRegStr: ( h: string ) => string = h => escapeRegExp( Switch.header( h, header ) );

			let h: string;
			if ( this.checkSingleSwitch( this.keys ) ) {
				h = getHeaderRegStr( config.header );
			} else {
				const h1 = getHeaderRegStr( config.onKey );
				const h2 = getHeaderRegStr( config.offKey );
				this.keys.push( [ h1, h2 ] );
				h = `(?:${ h1 }|${ h2 })`;
			}
			return {
				header: this.checkSingleSwitch( this.keys ) ? h : "",
				genRegExps: regParam.map( reg => {
					const regList = this.captureParams( reg );
					/* 将 ${OPT} 替换为的目标字符串 */
					const replaceStr = this.checkSingleSwitch( this.keys )
						? `(${ config.onKey }|${ config.offKey })`
						: "";
					const r = ["", ...regList].join( "\\s*" ).replace( "(#{OPT})", replaceStr );
					return Switch.regexp( addChar( h + r ), this.ignoreCase, this.dotAll );
				} )
			}
		} )
	}
	
	private checkSingleSwitch( keys: [ string, string ] | [ string, string ][] ): keys is [ string, string ] {
		return this.mode === "single";
	}
	
	public write() {
		const cfg = <SwitchConfig>this.raw;
		return {
			type: this.type,
			auth: this.auth,
			scope: this.scope,
			mode: cfg.mode,
			onKey: cfg.onKey,
			offKey: cfg.offKey,
			header: cfg.header,
			enable: this.enable,
			display: this.display,
			priority: this.priority
		};
	}

	private checkRegexps( regexps: SwitchConfig["regexps"] ): regexps is string[][] {
		return regexps.some( el => el instanceof Array );
	}
	
	public static read( cfg: SwitchInit, loaded ) {
		cfg.auth = loaded.auth;
		cfg.mode = loaded.mode;
		cfg.scope = loaded.scope;
		cfg.onKey = loaded.onKey;
		cfg.offKey = loaded.offKey;
		cfg.header = loaded.header;
		cfg.enable = loaded.enable;
		cfg.priority = Number.parseInt( loaded.priority ) || 0;
	}
	
	public match( content: string ): SwitchMatchResult | Unmatch {
		for ( const pairKey in this.regPairs ) {
			const pair = this.regPairs[pairKey];

			for ( const reg of pair.genRegExps ) {
				const res = reg.exec( content );
				if ( !res ) {
					continue;
				}
				const [ onKey, offKey ] = this.checkSingleSwitch( this.keys ) ? this.keys : this.keys[pairKey];
				let switchKey: string = "";
				if ( res[0].includes( onKey ) ) {
					switchKey = onKey;
				}
				if ( res[0].includes( offKey ) ) {
					switchKey = offKey;
				}

				return {
					type: this.type,
					header: pair.header,
					switch: switchKey,
					match: [ ...res ].slice( 1 ),
					isOn: switchKey === onKey
				};
			}
		}
		
		return { type: "unmatch", missParam: false };
	}
	
	public getFollow(): FollowInfo {
		const param = this.desc[1];
		
		let headers: string[], follow: string;
		
		if ( this.checkSingleSwitch( this.keys ) ) {
			const [ onKey, offKey ] = this.keys;
			const swi: string = `[${ onKey }|${ offKey }]`;
			follow = param.replace( "#{OPT}", swi );
			headers = this.regPairs.map( pair => pair.header );
		} else {
			headers = this.keys.flat();
			follow = param.replace( /#{OPT}/, "" )
				.trim()
				.replace( /\s+/g, " " );
		}
		return {
			headers,
			param: follow
		};
	}
	
	public getDesc( headerNum?: number ): string {
		const { headers, param } = this.getFollow();
		const headerList = headerNum ? headers.slice( 0, headerNum ) : headers;
		const follow = `${ headerList.join( "|" ) } ${ param }`;
		return Switch.addLineFeedChar(
			this.desc[0], follow,
			bot.config.directive.helpMessageStyle
		);
	}
}