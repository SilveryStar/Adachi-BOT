/**
Author: Ethereal
CreateTime: 2022/6/21
 */
import request from "#genshin/utils/requests";
import MsgManagement, * as msg from "./message";

let URL: string = `http://api.qingyunke.com/api.php?key=free&appid=0&msg=`;

const HEADERS = {
	"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.74 Safari/537.36 Edg/99.0.1150.46",
	"Accept-Encoding": "gzip, deflate",
	"Connection": "keep-alive",
	"Accept": "*/*"
};


export interface MSG {
	result: number;
	content: string;
};


/* 自动回复插件方法 */
export async function autoChat( messageData: msg.Message, sendMessage: msg.SendFunc ) {
	const mesg: string = messageData.raw_message;
	//开始匹配回答
	if ( mesg.length <= 0 ) {
		//随即回复一个表情包
		await sendMessage( "找我有和贵干？" );
		await sendMessage( getEmoji() );
	} else {
		await sendMessage( await getReplyMessage( mesg ) );
	}
}


//调用青云客的免费对话API，但是延迟比较高，2s左右，详情http://api.qingyunke.com/
async function getBaseReply( text: string ): Promise<MSG> {
	return new Promise( ( resolve, reject ) => {
		URL = encodeURI( URL + text );
		request( {
			method: "GET",
			url: URL,
			headers: {
				...HEADERS,
			},
			timeout: 6000
		} )
			.then( ( result ) => {
				const date: MSG = JSON.parse( result );
				resolve( date );
			} )
			.catch( ( reason ) => {
				reject( reason );
			} );
	} );
}

async function getReplyMessage( text: string ): Promise<string> {
	const msg: MSG = await getBaseReply( text );
	if ( msg.result !== 0 ) {
		return `接口挂掉啦~~`;
	}
	//API默认的名字是 “菲菲”，你可以改成你喜欢的名字
	//修改可能导致部分返回错误，比如 “菲菲公主” ---> “七七公主”
	var reg = new RegExp( '菲菲', "g" );
	return msg.content.replace( reg, 'BOT' ).trim();
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