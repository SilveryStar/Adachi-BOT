import { BasicConfig, CommandInfo, Unmatch } from "./main";
import BotConfig from "../config";
import { snakeCase, escapeRegExp } from "lodash";

export interface EnquireMatchResult {
	type: "enquire";
	matchPair: Record<string, string>;
}

interface RegUnit {
	regexp: string;
	senDesc: string;
}

interface MatchKeyword {
	upperSnakeCase: string;
	lowerCamelCase: string;
	reg: string;
	desc: string;
}

interface Sentence {
	keywords: string[];
	reg: RegExp;
}

export type EnquireConfig = CommandInfo & {
	type: "enquire";
	sentences: string[];
	definedPair: Record<string, RegUnit>;
};

export class Enquire extends BasicConfig {
	private readonly sentences: Sentence[] = [];
	private readonly units: MatchKeyword[] = [];
	private readonly rawSentences: string[];
	
	constructor( config: EnquireConfig, botCfg: BotConfig ) {
		super( config );
		const definedKeys: string[] = Object.keys( config.definedPair );
		
		if ( config.sentences.length === 0 ) {
			throw "sentences 未设置";
		}
		
		/* 检测保留词 */
		const hasReserved: boolean = definedKeys.some( el => el === "header" );
		if ( hasReserved ) {
			throw "definedPair 中包含配置保留词";
		}
		
		this.rawSentences = config.sentences;
		
		definedKeys.forEach( el => {
			const upper: string = Enquire.toUpperSnakeCase( el );
			this.units.push( {
				upperSnakeCase: upper,
				lowerCamelCase: el,
				reg: escapeRegExp( config.definedPair[el].regexp ),
				desc: config.definedPair[el].senDesc
			} );
		} );
		
		const globalHeader: string = botCfg.header;
		if ( config.sentences[0].includes( "#{HEADER}" ) ) {
			this.units.push( {
				upperSnakeCase: "#{HEADER}",
				lowerCamelCase: "header",
				reg: escapeRegExp( globalHeader ),
				desc: globalHeader
			} );
		}
		
		config.sentences.forEach( el => {
			this.units.forEach( unit => el.replace(
				unit.upperSnakeCase, `(${ unit.reg })`
			) );
			
			const match = <RegExpMatchArray>el.match( /#{[A-Z1-9_]}/g );
			const keywords: string[] = match.map( key =>
				( <MatchKeyword>this.units.find( el => el.upperSnakeCase === key ) )
					.lowerCamelCase
			);
			this.sentences.push( {
				keywords, reg: Enquire.regexp( el, this.ignoreCase )
			} );
		} );
	}
	
	private static toUpperSnakeCase( str: string ): string {
		return "#{" + snakeCase( str ).toUpperCase() + "}";
	}
	
	public write() {
		const cfg = <EnquireConfig>this.raw;
		return {
			type: "enquire",
			auth: cfg.auth,
			scope: cfg.scope,
			sentences: cfg.sentences,
			enable: true
		};
	}
	
	public static read( cfg: EnquireConfig, loaded ) {
		cfg.auth = loaded.auth;
		cfg.scope = loaded.scope;
		cfg.sentences = loaded.sentences;
	}
	
	public match( content: string ): EnquireMatchResult | Unmatch {
		for ( let sen of this.sentences ) {
			const res: RegExpExecArray | null = sen.reg.exec( content );
			if ( !res ) {
				continue;
			}
			
			const temp: string[] = res.splice( 1 );
			const length: number = temp.length;
			const matchPair: Record<string, string> = {}
			for ( let i = 0; i < length; i++ ) {
				matchPair[sen.keywords[i]] = temp[i];
			}
			return { type: "enquire", matchPair };
		}
		
		return { type: "unmatch" };
	}
	
	public getDesc(): string {
		const sentences: string[] = [];
		this.rawSentences.forEach( sen => {
			let str: string = sen;
			this.units.forEach( el => {
				str = str.replace( el.upperSnakeCase, el.desc );
			} );
			sentences.push( str );
		} );
		
		const [ func ] = this.desc;
		return func + [ "", ...sentences ].join( "\n" );
	}
}