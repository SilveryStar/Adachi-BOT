import { BasicConfig, CommandInfo, Unmatch } from "./main";
import BotConfig from "../config";
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
};

export class Switch extends BasicConfig {
	private readonly regexps: RegExp[] = [];
	private readonly keys: [ string, string ];
	private readonly mode: "single" | "divided";
	private readonly header: string;
	
	constructor( config: SwitchConfig, botCfg: BotConfig ) {
		super( config );
		
		if ( config.onKey === config.offKey ) {
			throw `指令 ${ config.cmdKey } 配置错误: onKey 与 offKey 不可相同`;
		}
		if ( config.offKey.length === 0 || config.onKey.length === 0 ) {
			throw `指令 ${ config.cmdKey } 配置错误: onKey 和 offKey 不可为空`;
		}
		
		const globalHeader: string = botCfg.header;
		const process: ( h: string ) => string = h => escapeRegExp(
			Switch.header( h, globalHeader )
		);
		const addChar: ( s: string ) => string = s => Switch.addStartStopChar(
			s, config.start !== false, config.stop !== false
		);
		
		this.mode = config.mode;
		this.header = config.header;
		
		if ( config.mode === "single" ) {
			let reg: string = config.regexp instanceof Array
							? [ "", ...config.regexp ].join( " *" )
							: config.regexp;
			const h: string = process( config.header );
			const r: string = reg.replace(
				"#{OPT}",
				`(${ config.onKey }|${ config.offKey })`
			);
			this.regexps.push( Switch.regexp( addChar( h + r ), this.ignoreCase ) );
			this.keys = [ config.onKey, config.offKey ];
		} else {
			const r: string = config.regexp instanceof Array
							? [ "", ...config.regexp.filter( el => el !== "#{OPT}" ) ].join( " *" )
							: config.regexp.replace( "#{OPT}", "" ).trim();
			const h1: string = process( config.onKey );
			const h2: string = process( config.offKey );
			this.regexps.push( Switch.regexp(
				addChar( `(${ h1 }|${ h2 })${ r }` ),
				this.ignoreCase
			) );
			this.keys = [ h1, h2 ];
		}
	}
	
	public write() {
		const cfg = <SwitchConfig>this.raw;
		return  {
			type: "switch",
			auth: this.auth,
			scope: this.scope,
			mode: cfg.mode,
			onKey: cfg.onKey,
			offKey: cfg.offKey,
			header: cfg.header,
			enable: true
		};
	}
	
	public static read( cfg: SwitchConfig, loaded ) {
		cfg.auth = loaded.auth;
		cfg.mode = loaded.mode;
		cfg.scope = loaded.scope;
		cfg.onKey = loaded.onKey;
		cfg.offKey = loaded.offKey;
		cfg.header = loaded.header;
	}
	
	public match( content: string ): SwitchMatchResult | Unmatch {
		for ( let reg of this.regexps ) {
			const res: RegExpExecArray | null = reg.exec( content );
			if ( !res ) {
				continue;
			}
			
			const [ onKey, offKey ]: [ string, string ] = this.keys;
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
			if ( this.mode === "single" ) {
				match.shift();
			}
			
			return {
				type: "switch",
				switch: switchKey,
				match, isOn
			};
		}
		
		return { type: "unmatch" };
	}
	
	public getDesc(): string {
		const [ func, param ] = this.desc;
		const [ onKey, offKey ] = this.keys;
		
		let header: string, follow: string;
		
		if ( this.mode === "single" ) {
			const swi: string = `[${ onKey }|${ offKey }]`;
			follow = param.replace( "#{OPT}", swi );
			header = this.header;
		} else {
			header = `${ onKey }|${ offKey }`;
			follow = param.replace( /#{OPT}/, "" )
						  .trim()
						  .replace( /\s+/g, " " );
		}
		
		return Switch.addLineFeedChar(
			func, `${ header } ${ follow }`,
			bot.config.helpMessageStyle
		);
	}
}