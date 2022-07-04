import { FakeMessage, Sendable } from "oicq";
import { BasicConfig, InputParameter, Order } from "@modules/command";
import Command from "@modules/command/main";
import FileManagement from "@modules/file";
import { filterUserUsableCommand } from "../utils/filter";
import { RenderResult } from "@modules/renderer";
import { renderer } from "../init";

interface HelpCommand {
	id: number;
	header: string;
	body: string
	cmdKey: string;
	detail: string;
	pluginName: string;
}

function getVersion( file: FileManagement ): string {
	const path: string = file.getFilePath( "package.json", "root" );
	const { version } = require( path );
	return version.split( "-" )[0];
}

function messageStyle( title: string, list: string[], command: Command ): Sendable {
	const DETAIL = <Order>command.getSingle( "adachi.detail" );
	list.push( "", `使用 ${ DETAIL.getHeaders()[0] }+指令序号 获取更多信息`, );
	list.push( "[] 表示必填, () 表示选填, | 表示选择" );
	return [ title, ...list ].join( "\n" );
}

async function forwardStyle(
	title: string, list: string[],
	{ config, client, command }: InputParameter
): Promise<Sendable> {
	const content: FakeMessage[] = [];
	
	const DETAIL = <Order>command.getSingle( "adachi.detail" );
	list.push( `使用 ${ DETAIL.getHeaders()[0] }+指令序号 获取更多信息` );
	list.push( "[] 表示必填, () 表示选填, | 表示选择" );
	list.forEach( el => content.push( {
		user_id: config.number,
		nickname: "BOT",
		message: {
			type: "text",
			data: { text: el }
		}
	} ) );
	
	const reply = await client.makeForwardMsg( content );
	if ( reply.status === "ok" ) {
		const content: string = reply.data.data.data;
		reply.data.data.data = content.replace( "[聊天记录]", "[Adachi-BOT 帮助信息]" )
			.replace( "转发的聊天记录", title )
			.replace( /查看\d+条转发消息/, "点击查看更多指令" );
		return reply.data;
	}
	return "";
}

function xmlStyle( title: string, list: string[], command: Command ): Sendable {
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
	
	const DETAIL = <Order>command.getSingle( "adachi.detail" );
	const xmlFoot: string = "</summary>" +
		'<hr hidden="false" style="0" />' +
		'<summary size="26">' +
		`使用 ${ DETAIL.getHeaders()[0] }+指令序号 获取更多信息\n` +
		"&#91;&#93; 表示必填&#44; () 表示选填&#44; | 表示选择" +
		"</summary>" +
		"</item>" +
		'<source name="" icon="" action="" appid="-1" />' +
		"</msg>" +
		",type=1]";
	
	return xmlHead + xmlBody + xmlFoot;
}

/* 使用图片帮助 */
async function cardStyle( i: InputParameter, commands: BasicConfig[], version: string ) {
	const dbKey = "adachi.help-data";
	
	const cmdList: HelpCommand[] = commands.map( ( cmd, cKey ) => {
		return {
			id: cKey + 1,
			header: cmd.desc[0],
			body: cmd.getFollow(),
			cmdKey: cmd.cmdKey,
			detail: cmd.detail,
			pluginName: cmd.pluginName
		};
	} );
	
	const cmdData: Record<string, HelpCommand[]> = {};
	for ( const cmd of cmdList ) {
		cmdData[cmd.pluginName] = cmdData[cmd.pluginName] ? [ ...cmdData[cmd.pluginName], cmd ] : [ cmd ];
	}
	
	const DETAIL = <Order>i.command.getSingle( "adachi.detail" );
	
	await i.redis.setString( dbKey, JSON.stringify( {
		detailCmd: DETAIL.getHeaders()[0],
		version: version,
		commands: cmdData
	} ) );
	
	const res: RenderResult = await renderer.asCqCode(
		"/index.html" );
	if ( res.code === "ok" ) {
		return res.data;
	} else {
		i.logger.error( res.error );
		return "图片渲染异常，请联系持有者进行反馈";
	}
}

async function getHelpMessage(
	title: string, version: string,
	commands: BasicConfig[], list: string[],
	i: InputParameter
): Promise<Sendable> {
	switch ( i.config.helpMessageStyle ) {
		case "message":
			return messageStyle( title, list, i.command );
		case "forward":
			return await forwardStyle( title, list, i );
		case "xml":
			return xmlStyle( title, list, i.command );
		case "card":
			return await cardStyle( i, commands, version );
		default:
			return "";
	}
}

export async function main( i: InputParameter ): Promise<void> {
	const version = getVersion( i.file );
	const showKeys = i.messageData.raw_message === "-k";
	const commands = await filterUserUsableCommand( i );
	if ( commands.length === 0 ) {
		await i.sendMessage( "没有可用的指令" );
		return;
	}
	
	const title: string = `Adachi-BOT v${ version }~`;
	let ID: number = 0;
	if ( showKeys ) {
		const keys: string = commands.reduce( ( pre, cur ) => {
			return pre + `\n${ ++ID }. ${ cur.getCmdKey() }`;
		}, "" );
		await i.sendMessage( title + keys );
	} else {
		const msgList: string[] = commands.map( el => `${ ++ID }. ${ el.getDesc() }` );
		await i.sendMessage( await getHelpMessage( title, version, commands, msgList, i ), false );
	}
}