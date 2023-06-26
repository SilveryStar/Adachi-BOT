import { BasicConfig, CommandInfo, FollowInfo, Unmatch } from "./main";
import { BotConfig } from "@/modules/config";
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
	priority?: number;
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
		
		const headers: string[] = config.headers.map( el => Order.header( el, botCfg.directive.header ) );
		
		this.regParam = this.checkRegexps( config.regexps ) ? config.regexps : [ config.regexps ];
		this.regPairs = headers.map( header => ( {
			header,
			genRegExps: this.regParam.map( reg => {
				const r: string = [ "", ...reg ].join( "\\s*" );
				const h: string = escapeRegExp( header );
				const pattern: string = Order.addStartStopChar(
					h + r,
					config.start !== false,
					config.stop !== false
				);
				return Order.regexp( pattern, this.ignoreCase );
			} )
		} ) );
	}
	
	private checkRegexps( regexps: OrderConfig["regexps"] ): regexps is string[][] {
		return regexps.some( el => el instanceof Array );
	}
	
	public static read( cfg: OrderConfig, loaded ) {
		cfg.headers = loaded.headers;
		cfg.auth = loaded.auth;
		cfg.scope = loaded.scope;
		cfg.enable = loaded.enable;
		cfg.priority = Number.parseInt( loaded.priority ) || 0;
	}
	
	public write() {
		const cfg = <OrderConfig>this.raw;
		return {
			type: "order",
			auth: this.auth,
			scope: this.scope,
			headers: cfg.headers,
			enable: this.enable,
			priority: this.priority
		};
	}
	
	public getExtReg( pair: RegPair ) {
		const config = bot.config.directive;
		/* 是否存在指令起始符 */
		const hasHeader = config.header ? pair.header.includes( config.header ) : false;
		const rawHeader = pair.header.replace( config.header, "" );
		
		let headerRegStr: string = "";
		if ( config.fuzzyMatch && rawHeader.length !== 0 && /[\u4e00-\u9fa5]/.test( rawHeader ) ) {
			headerRegStr = `${ hasHeader ? "(?=^" + config.header + ")" : "" }(?=.*?${ rawHeader })`;
		} else if ( config.matchPrompt && config.header && pair.header ) {
			headerRegStr = "^" + pair.header;
		}
		
		return headerRegStr || null;
	}
	
	public match( content: string ): OrderMatchResult | Unmatch {
		const config = bot.config.directive;
		try {
			this.regPairs.forEach( pair => {
				const headerRegStr = this.getExtReg( pair );
				const headerReg = headerRegStr ? new RegExp( headerRegStr ) : null;
				
				const rawHeader = pair.header.replace( config.header, "" );
				pair.genRegExps.forEach( reg => {
					/* 若直接匹配不成功，则匹配指令头，判断参数是否符合要求 */
					if ( reg.test( content ) ) {
						throw { type: "order", header: pair.header };
					} else if ( headerReg && headerReg.test( content ) ) {
						const header = config.header == "" ? pair.header : `${ config.header }|${ rawHeader }`;
						
						const fogReg = new RegExp( header, "g" );
						/* 重组正则，判断是否参数不符合要求 */
						content = content.replace( fogReg, "" );
						for ( let params of this.regParam ) {
							params = [ pair.header, ...params ];
							const paramReg = new RegExp( `^${ params.join( "\\s*" ) }$` );
							const matchParam = paramReg.test( pair.header + content );
							if ( matchParam ) {
								throw { type: "order", header: pair.header };
							}
						}
						throw { type: "unmatch", missParam: true, header: pair.header, param: content };
					}
				} )
			} );
		} catch ( data ) {
			return <OrderMatchResult | Unmatch>data;
		}
		return { type: "unmatch", missParam: false };
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
		return Order.addLineFeedChar(
			this.desc[0], follow,
			bot.config.directive.helpMessageStyle
		);
	}
	
	public getHeaders(): string[] {
		return this.regPairs.map( el => el.header );
	}
}