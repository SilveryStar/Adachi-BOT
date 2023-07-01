import { BasicConfig, CommandInfo, FollowInfo, Unmatch } from "./main";
import { BotConfig } from "@/modules/config";
import bot from "ROOT";
import { escapeRegExp, trimStart } from "lodash";

export interface SwitchMatchResult {
	type: "switch";
	switch: string;
	match: string[];
	isOn(): boolean;
}

export type SwitchConfig = CommandInfo & {
	type: "switch";
	mode: "single" | "divided";
	onKey: string;
	offKey: string;
	header: string;
	regexp: string | string[];
	start?: boolean;
	stop?: boolean;
	priority?: number;
};

interface RegPair {
	header: string;
	regExp: RegExp;
}

export class Switch extends BasicConfig {
	public readonly type = "switch";
	private readonly mode: "single" | "divided";
	public readonly regPairs: RegPair[] = [];
	private readonly keys: [ string, string ] | [ string, string ][];
	
	constructor( config: SwitchConfig, botCfg: BotConfig, pluginName: string ) {
		super( config, pluginName );
		
		this.mode = config.mode;
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
		
		this.regPairs = botCfg.directive.header.map( header => {
			const getHeaderRegStr: ( h: string ) => string = h => escapeRegExp( Switch.header( h, header ) );
			
			if ( this.checkSingleSwitch( this.keys ) ) {
				let reg: string = config.regexp instanceof Array
					? [ "", ...config.regexp ].join( "\\s*" )
					: config.regexp;
				const h: string = getHeaderRegStr( config.header );
				const r: string = reg.replace(
					"#{OPT}",
					`(${ config.onKey }|${ config.offKey })`
				);
				return {
					header: h,
					regExp: Switch.regexp( addChar( h + r ), this.ignoreCase )
				}
			} else {
				const r: string = config.regexp instanceof Array
					? [ "", ...config.regexp.filter( el => el !== "#{OPT}" ) ].join( "\\s*" )
					: config.regexp.replace( "#{OPT}", "" ).trim();
				const h1: string = getHeaderRegStr( config.onKey );
				const h2: string = getHeaderRegStr( config.offKey );
				this.keys.push( [ h1, h2 ] );
				return {
					header: "",
					regExp: Switch.regexp( addChar( `(${ h1 }|${ h2 })${ r }` ), this.ignoreCase )
				};
			}
		} )
	}
	
	private checkSingleSwitch( keys: [ string, string ] | [ string, string ][] ): keys is [ string, string ] {
		return this.mode === "single";
	}
	
	public write() {
		const cfg = <SwitchConfig>this.raw;
		return {
			type: "switch",
			auth: this.auth,
			scope: this.scope,
			mode: cfg.mode,
			onKey: cfg.onKey,
			offKey: cfg.offKey,
			header: cfg.header,
			enable: this.enable,
			priority: this.priority
		};
	}
	
	public static read( cfg: SwitchConfig, loaded ) {
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
			const res: RegExpExecArray | null = pair.regExp.exec( content );
			if ( !res ) {
				continue;
			}
			
			const [ onKey, offKey ] = this.checkSingleSwitch( this.keys ) ? this.keys : this.keys[pairKey];
			const temp: string[] = res.splice( 1 );
			
			let switchKey: string = "";
			if ( temp.includes( onKey ) ) {
				switchKey = onKey;
			}
			if ( temp.includes( offKey ) ) {
				switchKey = offKey;
			}
			
			const isOn = () => switchKey === onKey;
			const match = res[0].replace( / +/g, " " )
				.split( " " )
				.filter( el => el !== switchKey )
				.map( el => trimStart( el ) );
			if ( match.length !== 0 ) {
				if ( this.mode === "single" ) {
					if ( match[0].includes( pair.header ) ) {
						match[0] = match[0].split( pair.header ).join( "" );
					}
				} else if ( this.mode === "divided" ) {
					if ( match[0].includes( onKey ) ) {
						match[0] = match[0].split( onKey ).join( "" );
					}
					if ( match[0].includes( offKey ) ) {
						match[0] = match[0].split( offKey ).join( "" );
					}
				}
				if ( match[0].length === 0 ) {
					match.shift();
				}
			}
			
			return {
				type: "switch",
				switch: switchKey,
				match, isOn
			};
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