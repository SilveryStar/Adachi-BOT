/**
Author: Ethereal
CreateTime: 2022/6/21
 */
import bot from "ROOT";
import * as msg from "./message";
import request from "#genshin/utils/requests";

const tencentCloud = require( "tencentcloud-sdk-nodejs-nlp" );

const URL: string = `http://api.qingyunke.com/api.php?key=free&appid=0&msg=`;
//实例化Nlp需要的参数
const NlpClient = tencentCloud.nlp.v20190408.Client;
const clientConfig = {
	credential: {
		secretId: bot.config.autoChat.secretId,
		secretKey: bot.config.autoChat.secretKey,
	},
	region: "ap-guangzhou",
	profile: {
		httpProfile: {
			endpoint: "nlp.tencentcloudapi.com",
		},
	},
};
//实例化NLP对象
const client = new NlpClient( clientConfig );

/* 自动回复插件方法 */
export async function autoChat( messageData: string, sendMessage: msg.SendFunc ) {
	//开始匹配回答
	if ( messageData.length <= 0 ) {
		//随即回复一个表情包
		await sendMessage( "找我有和贵干？" );
		await sendMessage( getEmoji() );
	} else {
		await sendMessage( await getReplyMessage( messageData ) );
	}
}

//调用青云客的免费对话API，有时候不太稳定，详情http://api.qingyunke.com/
async function getQYKReply( text: string ): Promise<string> {
	return new Promise( ( resolve, reject ) => {
		const url = encodeURI( URL + text );
		request( {
			method: "GET",
			url: url,
			timeout: 6000
		} )
			.then( ( result ) => {
				const date = JSON.parse( result );
				resolve( date.content );
			} )
			.catch( ( reason ) => {
				reject( reason );
			} );
	} );
}


async function getReplyMessage( text: string ): Promise<string> {
	let msg = "";
	if ( bot.config.autoChat.type === 2 ) {
		//调用腾讯NLP接口回复
		msg = await getTencentReply( text );
	} else {
		msg = await getQYKReply( text );
		/** API默认的名字是 “菲菲”，你可以改成你喜欢的名字
		 * 修改可能导致部分返回错误，比如 “菲菲公主” ---> “七七公主”
		 * 比较鸡肋的修改，暂时注释掉吧 */
		// const reg = new RegExp( '菲菲', "g" );
		// msg.replace( reg, 'BOT' ).trim();
	}
	if ( msg.length <= 0 ) {
		return `接口挂掉啦~~`;
	}
	return msg;
}

//获取随机表情包
function getEmoji(): string {
	//当指令后没有跟数据，随机返回此数组里面的一句话
	var text = [ "[CQ:image,file=c4d4506256984e0951ae70ef2d39c7af43207-300-435.gif,url=https://c2cpicdw.qpic.cn/offpic_new/1678800780//1678800780-2229448361-C4D4506256984E0951AE70EF2D39C7AF/0?term=2]",
		"[CQ:image,file=4e83609698bc1753845aa0be8d66051d239776-360-360.gif,url=https://c2cpicdw.qpic.cn/offpic_new/1678800780//1678800780-4170714532-4E83609698BC1753845AA0BE8D66051D/0?term=2]",
		"[CQ:image,file=e9bd0789f60b2045ecba19e36dd25ec71068961-360-202.gif,url=https://c2cpicdw.qpic.cn/offpic_new/1678800780//1678800780-3888586142-E9BD0789F60B2045ECBA19E36DD25EC7/0?term=2]",
		"[CQ:image,file=d757d5240d4b157d098b1719921969a11565-50-50.jpg,url=https://c2cpicdw.qpic.cn/offpic_new/1678800780//1678800780-2518379710-D757D5240D4B157D098B1719921969A1/0?term=2]"
	];
	//Math.random()返回0-1之间随机一个数，确保text数组长度不要为1，可能会报空指针异常
	return text[Math.round( Math.random() * text.length - 1 )];
}

async function getTencentReply( text: string ): Promise<string> {
	const params = { "Query": text };
	const reply = await client.ChatBot( params );
	return reply.Reply ? reply.Reply : "请求出错了";
}


