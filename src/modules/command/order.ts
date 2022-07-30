import { BasicConfig, CommandInfo, Unmatch } from "./main";
import BotConfig from "../config";
import bot from "ROOT";
import { escapeRegExp } from "lodash";

export interface OrderMatchResult {
	type: "order";
	header: string;
}

export type OrderConfig = CommandInfo & {
	type: "order";
	headers: string[];
	regexps: string[] | string[][];
	start?: boolean;
	stop?: boolean;
};

interface RegPair {
	header: string;
	genRegExps: RegExp[];
}

export class Order extends BasicConfig {
	public readonly type = "order";
	public readonly regPairs: RegPair[] = [];
	public readonly regParam: string[][];
	
	constructor( config: OrderConfig, botCfg: BotConfig, pluginName: string ) {
		super( config, pluginName );
		
		const headers: string[] = [];
		headers.push( ...config.headers.map( el => Order.header( el, botCfg.header ) ) );
		if ( this.desc[0].length > 0 ) {
			headers.push( Order.header( this.desc[0], botCfg.header ) ); //添加中文指令名作为识别
		}
		
		let rawRegs = <string[][]>config.regexps;
		const isDeep: boolean = config.regexps.some( el => el instanceof Array );
		if ( !isDeep ) {
			rawRegs = [ <string[]>config.regexps ];
		}
		this.regParam = rawRegs;
		
		for ( let header of headers ) {
			const pair: RegPair = { header, genRegExps: [] };
			for ( let reg of rawRegs ) {
				const r: string = [ "", ...reg ].join( " *" );
				const h: string = escapeRegExp( header );
				const pattern: string = Order.addStartStopChar(
					h + r,
					config.start !== false,
					config.stop !== false
				);
				pair.genRegExps.push( Order.regexp( pattern, this.ignoreCase ) );
			}
			this.regPairs.push( pair );
		}
	}
	
	public static read( cfg: OrderConfig, loaded ) {
		cfg.headers = loaded.headers;
		cfg.auth = loaded.auth;
		cfg.scope = loaded.scope;
	}
	
	public write() {
		const cfg = <OrderConfig>this.raw;
		return {
			type: "order",
			auth: this.auth,
			scope: this.scope,
			headers: cfg.headers,
			enable: true
		};
	}
	
	public match( content: string ): OrderMatchResult | Unmatch {
		try {
			this.regPairs.forEach( pair => pair.genRegExps.forEach( reg => {
				if ( reg.test( content ) ) {
					throw { type: "order", header: pair.header };
				} else {
					/* 直接匹配失败，中文header支持模糊识别 */
					const rawHeader = pair.header.replace( bot.config.header, "" );
					let header = pair.header;
					if ( /[\u4e00-\u9fa5]/.test( rawHeader ) && ( bot.config.header !== "" ) ) {
						header = `${ bot.config.header }?${ rawHeader }`;
					}
					const fogReg = new RegExp( header, "g" );
					/* 判断是否参数不符合要求 */
					if ( fogReg.test( content ) ) {
						content = content.replace( fogReg, "" );
						for ( let params of this.regParam ) {
							const matchParam = params.every( param => {
								return new RegExp( param ).test( content );
							} );
							if ( matchParam ) {
								throw { type: "order", header: pair.header };
							}
						}
						throw { type: "unmatch", missParam: true, header: pair.header, param: content };
					}
				}
			} ) );
		} catch ( data ) {
			return <OrderMatchResult | Unmatch>data;
		}
		return { type: "unmatch", missParam: false };
	}
	
	public getFollow(): string {
		const pairs = this.regPairs.concat();
		if ( pairs[pairs.length - 1].header === Order.header( this.desc[0], bot.config.header ) ) {
			pairs.pop();
		}
		const headers: string = pairs
			.map( el => el.header )
			.join( "|" );
		const param = this.desc[1];
		return `${ headers } ${ param }`;
	}
	
	public getDesc(): string {
		const follow = this.getFollow();
		return Order.addLineFeedChar(
			this.desc[0], follow,
			bot.config.helpMessageStyle
		);
	}
	
	public getHeaders(): string[] {
		return this.regPairs.map( el => el.header );
	}
}