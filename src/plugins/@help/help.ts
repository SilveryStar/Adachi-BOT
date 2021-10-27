import { CommonMessageEventData as Message, FakeMessage, Sendable } from "oicq";
import { sendType } from "../../modules/message";
import { filterUserUsableCommand } from "./filter";
import { getHeader as h } from "../genshin/utils/header";
import { ROOTPATH } from "../../../app";
import { Adachi, botConfig } from "../../bot";

function getVersion(): string {
	const { version } = require( `${ ROOTPATH }/package.json` );
	return version;
}

function messageStyle( title: string, list: string[] ): Sendable {
	list.push( "", `使用 ${ h( "adachi.detail" )[0] }+指令编号 获取更多信息`, );
	list.push( "[] 表示必填, () 表示选填, | 表示选择" );
	return [ title, ...list ].join( "\n" );
}

async function forwardStyle( title: string, list: string[] ): Promise<Sendable> {
	const content: FakeMessage[] = [];
	
	list.push( `使用 ${ h( "adachi.detail" )[0] }+指令编号 获取更多信息` );
	list.push( "[] 表示必填, () 表示选填, | 表示选择" );
	list.forEach( el => content.push( {
		user_id: botConfig.number,
		nickname: "BOT",
		message: {
			type: "text",
			data: { text: el }
		}
	} ) );
	
	const reply = await Adachi.makeForwardMsg( content );
	if ( reply.status === "ok" ) {
		const content: string = reply.data.data.data;
		reply.data.data.data = content.replace( "[聊天记录]", "[Adachi-BOT 帮助信息]" )
									  .replace( "转发的聊天记录", title )
									  .replace( /查看\d+条转发消息/, "点击查看更多指令" );
		return reply.data;
	}
	return "";
}

function xmlStyle( title: string, list: string[] ): Sendable {
	const xmlHead: string = "[CQ:xml,data=" +
							'<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>' +
							'<msg serviceID="1" templateID="0" action="web" brief="&#91;Adachi-BOT 帮助信息&#93;" sourceMsgId="0" url="" flag="2" adverSign="0" multiMsgFlag="0">' +
							'<item layout="0" advertiser_id="0" aid="0" />' +
							'<item layout="6" advertiser_id="0" aid="0">' +
								`<title size="30" maxLines="2" lineSpace="36">${ title }</title>` +
								'<summary size="24">';
	
	const xmlBody: string = list.map( el => {
		return el.replace( /\[/g, "&#91;" )
			     .replace( /]/g, "&#93;" );
	} ).join( "\n" );
	
	const xmlFoot: string =     "</summary>" +
								'<hr hidden="false" style="0" />' +
								'<summary size="26">' +
									`使用 ${ h( "adachi.detail" )[0] }+指令编号 获取更多信息\n` +
									"&#91;&#93; 表示必填&#44; () 表示选填&#44; | 表示选择" +
								"</summary>" +
							"</item>" +
							'<source name="" icon="" action="" appid="-1" />' +
							"</msg>" +
							",type=1]";

	return xmlHead + xmlBody + xmlFoot;
}

async function getHelpMessage( title: string, list: string[] ): Promise<Sendable> {
	switch ( botConfig.helpMessageStyle ) {
		case "message": return messageStyle( title, list );
		case "forward": return await forwardStyle( title, list );
		case "xml": return xmlStyle( title, list );
		default: return "";
	}
}

async function main( sendMessage: sendType, message: Message ): Promise<void> {
	const title: string = `Adachi-BOT v${ getVersion() }~`;
	const commands = await filterUserUsableCommand( message );
	if ( commands.length === 0 ) {
		await sendMessage( "没有可用的指令" );
		return;
	}
	
	let ID: number = 0;
	if ( message.raw_message === "-k" ) {
		const keys: string = commands.reduce( ( pre, cur ) => {
			return pre + `${ ++ID }. ${ cur.getKeysInfo() }`;
		}, "" );
		await sendMessage( title + keys );
	} else {
		const msgList: string[] = commands.map( el => `${ ++ID }. ${ el.docs }` );
		await sendMessage( await getHelpMessage( title, msgList ), false );
	}
}

export { main }