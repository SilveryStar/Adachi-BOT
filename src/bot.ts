import { Client, CommonMessageEventData, createClient, GroupMessageEventData, PrivateMessageEventData } from "oicq";
import { getSendMessageFunc, MessageType, removeStringPrefix } from "./modules/message";
import { createFolder, createYAML, exists, loadYAML } from "./utils/config";
import { loadPlugins } from "./modules/plugin";
import { resolve } from "path";
import { readFileSync, renameSync } from "fs";
import { AuthLevel, getAuthLevel } from "./modules/auth";
import { Database } from "./utils/database";
import { Command } from "./modules/command";
import { ROOTPATH } from "../app";

/* setting.yml 配置文件 */
let botConfig: any;
/* bot 实例对象 */
let Adachi: Client;
/* redis 数据库实例 */
let Redis: Database;
/* 插件列表 */
let groupCommands: Command[][] = [];
let privateCommands: Command[][] = [];

function init(): void {
	if ( exists( "config" ) ) {
		return;
	}
	
	/* 初始化配置、数据库、插件文件夹 */
	createFolder( "config" );
	createFolder( "database" );
	
	/* 初始化账号配置文件 */
	createYAML( "setting", {
		number: "QQ 账号",
		password: "QQ 密码",
		master: "BOT 持有者账号",
		header: "命令起始符(可为空)",
		platform: "1.安卓手机(默认) 2.aPad 3.安卓手表 4.MacOS 5.iPad",
		dbPort: 56379
		
	} );
	
	/* 初始化命令头配置文件 */
	createYAML( "commands", {
		tips: "注意，修改后需重启"
	} );
	
	console.log( "环境初始化完成，请在 /config 文件夹中配置信息" );
	process.exit( 0 );
}

async function migrate(): Promise<void> {
	const mapPath: string = resolve( `${ ROOTPATH }/map.json` );
	if ( exists( mapPath ) ) {
		const content: string = readFileSync( mapPath, "utf-8" );
		const data: any = JSON.parse( content ).user;

		for ( let i in data ) {
			if ( data.hasOwnProperty( i ) ) {
				const dbKey: string = `silvery-star.user-bind-id-${ data[i].userID }`;
				await Redis.setString( dbKey, data[i].mhyID );
			}
		}
		renameSync( mapPath, `${ ROOTPATH }/used-data.json` )
	}
}

function setEnvironment(): void {
	botConfig = loadYAML( "setting" );
	
	if ( typeof botConfig.platform === "string" ) {
		botConfig.platform = 1;
	}
	
	Adachi = createClient( botConfig.number, {
		log_level: "debug",
		platform: botConfig.platform
	} );
	
	/* 处理登录滑动验证码 */
	Adachi.on( "system.login.slider", () => {
		process.stdin.once( "data", ( input: Buffer ) => {
			Adachi.sliderLogin( input.toString() );
		} );
	} );
	
	/* 处理登录图片验证码 */
	Adachi.on( "system.login.captcha", () => {
		process.stdin.once( "data", ( input: Buffer ) => {
			Adachi.sliderLogin( input.toString() );
		} );
	} );
	
	/* 处理设备锁事件 */
	Adachi.on( "system.login.device", () => {
		Adachi.logger.mark( "手机扫码完成后按下 Enter 继续...\n" );
		process.stdin.once( "data", () => {
			Adachi.login();
		} );
	} );
}

async function run(): Promise<void> {
	/* 登录 bot 账号 */
	Adachi.login( botConfig.password );
	/* 连接 Redis 数据库 */
	Redis = new Database( botConfig.dbPort );
	/* 加载插件 */
	await loadPlugins();

	/* 监听群消息事件，运行群聊插件 */
	Adachi.on( "message.group", async ( messageData: GroupMessageEventData ) => {
		const { raw_message: content, user_id: qqID, group_id: groupID } = messageData;
		const isBanned: boolean = await Redis.existListElement( "adachi.banned-group", groupID );
		if ( !isBanned ) {
			const auth: AuthLevel = await getAuthLevel( qqID );
			const groupLimit: string[] = await Redis.getList( `adachi.group-command-limit-${ groupID }` );
			const userLimit: string[] = await Redis.getList( `adachi.user-command-limit-${ qqID }` );
			const sendMessage: ( content: string ) => any = getSendMessageFunc( groupID, MessageType.Group );
			execute( sendMessage, messageData, content, groupCommands[auth], [ ...groupLimit, ...userLimit ] );
		}
	} );
	
	/* 监听私聊消息事件，运行私聊插件 */
	Adachi.on( "message.private", async ( messageData: PrivateMessageEventData ) => {
		const { raw_message: content, user_id: qqID } = messageData;
		const auth: AuthLevel = await getAuthLevel( qqID );
		const limit: string[] = await Redis.getList( `adachi.user-command-limit-${ qqID }` );
		const sendMessage: ( content: string ) => any = getSendMessageFunc( qqID, MessageType.Private );
		execute( sendMessage, messageData, content, privateCommands[auth], limit );
	} );
}

function execute( sendMessage: ( content: string ) => any, message: CommonMessageEventData, content: string, commands: Command[], limit: string[] ): void {
	for ( let command of commands ) {
		/* 判断命令限制 */
		if ( !limit.includes( command.key ) ) {
			const match: string | string[] = command.match( content );
			if ( typeof match === "string" && match !== "" ) {
				message.raw_message = removeStringPrefix( removeStringPrefix( content, match ), " " );
				command.run( sendMessage, message, match );
				break;
			}
			if ( match instanceof Array && match.length !== 0 ) {
				command.run( sendMessage, message, match );
				break;
			}
		}
	}
}

export {
	setEnvironment,
	migrate,
	run,
	init,
	Redis,
	Adachi,
	botConfig,
	groupCommands,
	privateCommands
}