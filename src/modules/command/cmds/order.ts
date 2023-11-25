import { BotConfig } from "@/modules/config";
import bot from "ROOT";
import { escapeRegExp, trimStart } from "lodash";
import { CommandCfg, CommandFunc, CommonInit, BasicConfig, FollowInfo, Unmatch } from "../main";

export interface OrderMatchResult {
	type: Order["type"];
	header: string;
	match: string[];
}

export type OrderConfig = CommandCfg & {
	type: Order["type"];
	headers: string[];
	regexps: string[] | string[][];
};

export type OrderInit = OrderConfig & CommonInit & {
	run: CommandFunc<Order["type"]>;
};

interface RegPair {
	header: string;
	genRegExps: RegExp[];
}

export class Order extends BasicConfig {
	public readonly type = "order";
	public readonly run: CommandFunc<Order["type"]>;
	public readonly regPairs: RegPair[] = [];
	
	constructor( config: OrderInit, botCfg: BotConfig ) {
		super( config, botCfg );
		
		this.run = config.run;
		
		const headers: string[] = config.headers.map( el => {
			if ( el.slice( 0, 2 ) === "__" ) {
				return trimStart( el, "_" );
			}
			return this.baseHeader.map( h => {
				return Order.header( el, h );
			} );
		} ).flat();
		
		const regParam = this.checkRegexps( config.regexps ) ? config.regexps : [ config.regexps ];
		this.regPairs = headers.map( header => ( {
			header,
			genRegExps: regParam.map( reg => {
				const regList = this.captureParams( reg );
				const r: string = [ "", ...regList ].join( "\\s*" );
				const h: string = escapeRegExp( header );
				const pattern: string = Order.addStartStopChar(
					h + r,
					config.start !== false,
					config.stop !== false
				);
				return Order.regexp( pattern, this.ignoreCase, this.dotAll );
			} )
		} ) );
	}
	
	private checkRegexps( regexps: OrderConfig["regexps"] ): regexps is string[][] {
		return regexps.some( el => el instanceof Array );
	}
	
	public static read( cfg: OrderInit, loaded ) {
		cfg.headers = loaded.headers;
		cfg.auth = loaded.auth;
		cfg.scope = loaded.scope;
		cfg.enable = loaded.enable;
		cfg.priority = Number.parseInt( loaded.priority ) || 0;
	}
	
	public write() {
		const cfg = <OrderConfig>this.raw;
		return {
			type: this.type,
			auth: this.auth,
			scope: this.scope,
			headers: cfg.headers,
			enable: this.enable,
			display: this.display,
			priority: this.priority
		};
	}
	
	private getHeaderRegStr(): string {
		const config = bot.config.directive;
		return config.header.map( h => escapeRegExp( h ) ).join( "|" );
	}
	
	// 获取去除 config.header 指令头的 pair.header 字符串
	private getPairHeader( pair: RegPair ): string {
		const headerRegStr = this.getHeaderRegStr();
		return pair.header.replace( Order.regexp( headerRegStr ), "" );
	}
	
	public getExtReg( pair: RegPair ) {
		const config = bot.config.directive;
		/* 当前指令起始符 */
		const curStarter = config.header.find( h => pair.header.includes( h ) );
		const rawHeader = this.getPairHeader( pair );
		
		let extRegStr: string = "";
		if ( config.fuzzyMatch && rawHeader.length !== 0 && /[\u4e00-\u9fa5]/.test( rawHeader ) ) {
			extRegStr = `${ curStarter ? "(?=^" + curStarter + ")" : "" }(?=.*?${ rawHeader })`;
		} else if ( config.matchPrompt && pair.header ) {
			extRegStr = "^" + pair.header;
		}
		
		return extRegStr || null;
	}
	
	public match( content: string ): OrderMatchResult | Unmatch {
		const config = bot.config.directive;
		for ( const pair of this.regPairs ) {
			const headerRegStr = this.getExtReg( pair );
			const headerReg = headerRegStr ? new RegExp( headerRegStr ) : null;
			
			const rawHeader = this.getPairHeader( pair );
			
			// 是否匹配成功指令头（用于判断是否触发指令的参数错误）
			let isMatchHeader = false;
			for ( const reg of pair.genRegExps ) {
				const match = reg.exec( content );
				if ( match ) {
					// 匹配成功
					return { type: this.type, header: pair.header, match: [ ...match ].slice( 1 ) };
				} else if ( headerReg && headerReg.test( content ) ) {
					// 直接匹配不成功但模糊匹配指令头成功时，仅开启了 fuzzyMatch 或 matchPrompt 后才会执行此部分
					const header = config.header.length ? `${ this.getHeaderRegStr() }|${ rawHeader }` : pair.header;
					const fogReg = new RegExp( header, "g" );
					
					const formatContent = pair.header + content.replace( fogReg, "" ).trim();
					const match = reg.exec( formatContent );
					if ( match ) {
						// 模糊匹配成功
						return { type: this.type, header: pair.header, match: [ ...match ].slice( 1 ) };
					}
					isMatchHeader = true;
				}
			}
			// 此时指令头匹配成功，但参数不正确
			if ( isMatchHeader ) {
				return { type: "unmatch", missParam: true, header: pair.header, param: content };
			}
		}
		// 匹配失败
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