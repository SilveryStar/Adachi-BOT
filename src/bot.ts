import {
	Client,
	GroupInfo,
	CommonMessageEventData,
	GroupMessageEventData,
	PrivateMessageEventData,
	GroupInviteEventData,
	FriendAddEventData,
	createClient
} from "oicq";
import { loadPlugins } from "./modules/plugin";
import { scheduleJob } from "node-schedule";
import { resolve } from "path";
import { trim } from "lodash";
import { createFolder, createYAML, exists } from "./utils/config";
import { readFileSync, renameSync, unlinkSync, readdirSync } from "fs";
import { getSendMessageFunc, removeStringPrefix, sendType, MessageType } from "./modules/message";
import { checkAuthLevel, getAuthLevel, AuthLevel } from "./modules/auth";
import { Command, CommandMatchResult } from "./modules/command";
import { Database } from "./utils/database";
import { BotConfig } from "./modules/config";
import { Interval } from "./modules/interval";
import { ROOTPATH } from "../app";

/* setting.yml 配置文件 */
let botConfig: BotConfig;
/* 操作时间间隔 */
let interval: Interval;
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
	
	/* 初始化米游社 Cookies 配置文件 */
	if ( exists( "src/plugins/genshin" ) ) {
		createYAML( "cookies", {
			cookies: [ "米游社Cookies(可多个)" ]
		} );
	}
	
	/* 初始化账号配置文件 */
	createYAML( "setting", BotConfig.initObject );
	
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
	botConfig = new BotConfig();
	
	Adachi = createClient( botConfig.number, {
		log_level: "debug",
		platform: botConfig.platform
	} );
	
	if ( botConfig.qrcode ) {
		/* 扫码登录 */
		Adachi.on( "system.login.qrcode", () => {
			Adachi.logger.mark( "手机扫码完成后按下 Enter 继续...\n" );
			process.stdin.once( "data", () => {
				Adachi.login();
			} );
		} );
		
		Adachi.login();
	} else {
		/* 处理登录滑动验证码 */
		Adachi.on( "system.login.slider", () => {
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
		
		Adachi.login( botConfig.password );
	}
}

async function run(): Promise<void> {
	/* 连接 Redis 数据库 */
	Redis = new Database( botConfig.dbPort );
	/* 加载命令间隔控制 */
	interval = new Interval();
	/* 加载插件 */
	await loadPlugins();
	
	/* 监听群消息事件，运行群聊插件 */
	Adachi.on( "message.group", async ( messageData: GroupMessageEventData ) => {
		const { raw_message: content, user_id: qqID, group_id: groupID } = messageData;
		if ( !interval.check( qqID, groupID ) ) {
			return;
		}
		
		const isBanned: boolean = await Redis.existListElement( "adachi.banned-group", groupID );
		const info = ( await Adachi.getGroupInfo( messageData.group_id ) ).data as GroupInfo;
		if ( !isBanned && info.shutup_time_me === 0 ) {
			const auth: AuthLevel = await getAuthLevel( qqID );
			const groupLimit: string[] = await Redis.getList( `adachi.group-command-limit-${ groupID }` );
			const userLimit: string[] = await Redis.getList( `adachi.user-command-limit-${ qqID }` );
			const sendMessage: sendType = getSendMessageFunc( qqID, MessageType.Group, groupID );
			execute( sendMessage, messageData, content, groupCommands[auth], [ ...groupLimit, ...userLimit ] );
		}
	} );
	
	/* 监听私聊消息事件，运行私聊插件 */
	Adachi.on( "message.private", async ( messageData: PrivateMessageEventData ) => {
		const { raw_message: content, user_id: qqID } = messageData;
		if ( !interval.check( qqID, -1 ) ) {
			return;
		}
		
		const auth: AuthLevel = await getAuthLevel( qqID );
		const limit: string[] = await Redis.getList( `adachi.user-command-limit-${ qqID }` );
		const sendMessage: sendType = getSendMessageFunc( qqID, MessageType.Private );
		execute( sendMessage, messageData, content, privateCommands[auth], limit );
	} );
	
	/* 自动接受入群邀请 */
	Adachi.on( "request.group.invite", async ( inviteData: GroupInviteEventData ) => {
		const inviterID: number = inviteData.user_id;
		if ( await checkAuthLevel( inviterID, botConfig.inviteAuth ) ) {
			await Adachi.setGroupAddRequest( inviteData.flag );
		} else {
			Adachi.logger.info( `用户 ${ inviterID } 权限不足邀请入群` );
		}
	} );
	
	/* 自动接受添加好友邀请 */
	Adachi.on( "request.friend.add", async ( addDate: FriendAddEventData ) => {
		await Adachi.setFriendAddRequest( addDate.flag );
	} );
	
	/* 定时清理图片下载缓存 */
	scheduleJob( "0 0 0 ? * WED", () => {
		const dirPath: string = resolve( ROOTPATH, "data/image" );
		const files: string[] = readdirSync( dirPath );
		files.forEach( el => {
			const path: string = resolve( dirPath, el );
			unlinkSync( path );
		} );
		Adachi.logger.info( "图片缓存已清空" );
	} );
}

function execute(
	sendMessage: sendType,
	message: CommonMessageEventData,
	content: string,
	commands: Command[],
	limit: string[]
): void {
	for ( let command of commands ) {
		/* 判断命令限制 */
		if ( !limit.includes( command.key ) ) {
			const res: CommandMatchResult = command.match( content );
			if ( res.type === "unmatch" ) {
				continue;
			}
			if ( res.type === "order") {
				message.raw_message = trim(
					removeStringPrefix( content, res.header )
						.replace( / +/g, " " )
				);
				command.run( sendMessage, message, res );
				break;
			} else {
				command.run( sendMessage, message, res );
			}
		}
	}
}

export {
	setEnvironment,
	migrate, run, init,
	Redis, Adachi,
	botConfig, interval,
	groupCommands, privateCommands
}