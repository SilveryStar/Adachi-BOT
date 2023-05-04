/**
Author: Ethereal
CreateTime: 2022/6/21
 */
import * as msg from "./message";
import fetch from "node-fetch";
import { Client } from "tencentcloud-sdk-nodejs-nlp/tencentcloud/services/nlp/v20190408/nlp_client";
import { urlParamsParse } from "@/utils/common";
import BotConfig from "@/modules/config";
import { Logger } from "log4js";
import { Sendable, segment } from "icqq";

export interface QKYResult {
	result: number;
	content: string;
}

interface XiaoAiResultSuccess {
	code: 200;
	data: {
		txt: string;
		tts: string;
	};
}

interface XiaoAiResultError {
	code: number;
	data: {
		msg: string;
	}
}

export type XiaoAiResult = XiaoAiResultSuccess | XiaoAiResultError;

const checkXiaoAiSuccess = ( res: XiaoAiResult ): res is XiaoAiResultSuccess => {
	return res.code === 200;
}

export default class AiChat {
	private nlpClient: Client | null = null;
	
	constructor(
		private config: BotConfig["autoChat"],
		private logger: Logger
	) {
		if ( ![ 1, 2, 3 ].includes( config.type ) ) {
			logger.error( "自动聊天类型配置异常，仅支持 1 - 3" );
			return;
		}
		if ( this.config.type === 2 ) {
			//实例化Nlp需要的参数
			const clientConfig = {
				credential: {
					secretId: this.config.secretId,
					secretKey: this.config.secretKey,
				},
				region: "ap-guangzhou",
				profile: {
					httpProfile: {
						endpoint: "nlp.tencentcloudapi.com",
					},
				},
			};
			//实例化NLP对象
			this.nlpClient = new Client( clientConfig );
		}
	}
	
	/* 自动回复方法 */
	public async autoChat( messageData: string, sendMessage: msg.SendFunc ) {
		//开始匹配回答
		if ( messageData.length <= 0 ) {
			//随即回复一个表情包
			await sendMessage( "找我有何贵干？" );
			await sendMessage( AiChat.getEmoji() );
		} else {
			try {
				await sendMessage( await this.getReplyMessage( messageData ) );
			} catch ( error: any ) {
				const errMsg = error.stack || error.message || error;
				this.logger.error( "自动聊天出错：" + errMsg );
			}
		}
	}
	
	private async getReplyMessage( text: string ): Promise<Sendable> {
		const replayFunction = ( <const>[ "getQYKReply", "getTencentReply", "getXiaoAiReply" ] )[this.config.type - 1];
		const msg = await this[replayFunction]( text );
		if ( typeof msg === "string" && msg.length <= 0 ) {
			return `接口挂掉啦~~`;
		}
		return msg;
	}
	
	//调用青云客的免费对话API，有时候不太稳定，详情http://api.qingyunke.com/
	private async getQYKReply( text: string ): Promise<Sendable> {
		const result = await fetch( urlParamsParse( "http://api.qingyunke.com/api.php", {
			key: "free",
			appid: 0,
			msg: text
		} ) );
		const data: QKYResult = await result.json();
		if ( data.result === 0 ) {
			return data.content;
		} else {
			throw new Error( data.content );
		}
	}
	
	private getTencentReply( text: string ): Promise<Sendable> {
		return new Promise( ( resolve, reject ) => {
			this.nlpClient!.ChatBot( {
				"Query": text
			}, ( error, rep ) => {
				if ( error ) {
					reject( new Error( error ) );
				} else {
					resolve( rep.Reply || "发生故障了~~" );
				}
			} ).catch( error => {
				reject( error );
			} )
		} );
	}
	
	// 使用慕名API: http://xiaoapi.cn
	private async getXiaoAiReply( text: string ): Promise<Sendable> {
		const result = await fetch( urlParamsParse( "https://xiaoapi.cn/API/lt_xiaoai.php", {
			type: "json",
			msg: text
		} ) );
		const res: XiaoAiResult = await result.json();
		if ( checkXiaoAiSuccess( res ) ) {
			return this.config.audio ? segment.record( res.data.tts ) : res.data.txt;
		} else {
			throw new Error( res.data.msg );
		}
	}
	
	//获取随机表情包
	private static getEmoji(): string {
		//当指令后没有跟数据，随机返回此数组里面的一句话
		const text = [ "[CQ:image,file=c4d4506256984e0951ae70ef2d39c7af43207-300-435.gif,url=https://c2cpicdw.qpic.cn/offpic_new/1678800780//1678800780-2229448361-C4D4506256984E0951AE70EF2D39C7AF/0?term=2]",
			"[CQ:image,file=4e83609698bc1753845aa0be8d66051d239776-360-360.gif,url=https://c2cpicdw.qpic.cn/offpic_new/1678800780//1678800780-4170714532-4E83609698BC1753845AA0BE8D66051D/0?term=2]",
			"[CQ:image,file=e9bd0789f60b2045ecba19e36dd25ec71068961-360-202.gif,url=https://c2cpicdw.qpic.cn/offpic_new/1678800780//1678800780-3888586142-E9BD0789F60B2045ECBA19E36DD25EC7/0?term=2]",
			"[CQ:image,file=d757d5240d4b157d098b1719921969a11565-50-50.jpg,url=https://c2cpicdw.qpic.cn/offpic_new/1678800780//1678800780-2518379710-D757D5240D4B157D098B1719921969A1/0?term=2]"
		];
		//Math.random()返回0-1之间随机一个数，确保text数组长度不要为1，可能会报空指针异常
		return text[Math.round( Math.random() * text.length - 1 )];
	}
}
