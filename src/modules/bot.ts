import * as sdk from "oicq";
import * as log from "log4js";
import moment from "moment";
import BotConfig from "./config";
import Database from "./database";
import Interval from "./management/interval";
import FileManagement from "./file";
import Plugin from "./plugin";
import WebConfiguration from "./logger";
import WebConsole from "@web-console/backend";
import RefreshConfig from "./management/refresh";
import Command, { BasicConfig, MatchResult } from "./command/main";
import Authorization, { AuthLevel } from "./management/auth";
import MsgManagement, * as msg from "./message";
import { Md5 } from "md5-typescript";
import { scheduleJob, JobCallback } from "node-schedule";
import { trim } from "lodash";
import { unlinkSync } from "fs";
import axios, { AxiosError } from "axios";

/**
 * @interface
 * BOT 工具类
 * @redis 数据库实例对象
 * @config 配置文件
 * @client BOT 实例对象
 * @logger BOT 内置日志对象
 * @interval 指令操作限制
 * @file 文件管理
 * @auth 权限管理
 * @message 消息管理
 * @command 指令集
 * @refresh 配置刷新
 * */
export interface BOT {
	readonly redis: Database;
	readonly config: BotConfig;
	readonly client: sdk.Client;
	readonly logger: log.Logger;
	readonly interval: Interval;
	readonly file: FileManagement;
	readonly auth: Authorization;
	readonly message: MsgManagement;
	readonly command: Command;
	readonly refresh: RefreshConfig;
}

export default class Adachi {
	public readonly bot: BOT;
	
	constructor( root: string ) {
		/* 初始化运行环境 */
		const file = new FileManagement( root );
		Adachi.setEnv( file );
		
		/* 初始化应用模块 */
		const config = new BotConfig( file );
		new WebConfiguration( config );
		if ( config.webConsole.enable ) {
			new WebConsole( config );
		}
		
		const client = sdk.createClient( config.number, {
			log_level: config.logLevel,
			platform: config.platform
		} );
		const logger = client.logger;
		process.on( "unhandledRejection", reason => {
			logger.error( ( <Error>reason ).stack );
		} );
		
		const redis = new Database( config.dbPort, logger, file );
		const interval = new Interval( config, redis );
		const auth = new Authorization( config, redis );
		const message = new MsgManagement( config, client );
		const command = new Command( file );
		const refresh = new RefreshConfig( file, command );
		
		this.bot = {
			client, command, file, redis,
			logger, message, auth, interval,
			config, refresh
		};
	}
	
	public run(): BOT {
		this.login();
		Plugin.load( this.bot ).then( commands => {
			this.bot.command.add( commands );
			/* 事件监听 */
			this.bot.client.on( "message.group", this.parseGroupMsg( this ) );
			this.bot.client.on( "message.private", this.parsePrivateMsg( this ) );
			this.bot.client.on( "request.group.invite", this.acceptInvite( this ) );
			this.bot.client.on( "request.friend.add", this.acceptFriend( this ) );
			this.bot.logger.info( "事件监听启动成功" );
		} );
		
		scheduleJob( "0 59 */1 * * *", this.hourlyCheck( this ) );
		scheduleJob( "0 0 4 ? * WED", this.clearImageCache( this ) );
		scheduleJob( "15 58 0 * * *", this.postUserData( this ) );
		
		return this.bot;
	}
	
	private static setEnv( file: FileManagement ): void {
		const exist: boolean = file.createDir( "config", "root" );
		if ( exist ) {
			return;
		}
		
		/* Created by http://patorjk.com/software/taag  */
		/* Font Name: Big                               */
		const greet =
`====================================================================
                _            _     _        ____   ____ _______
       /\\      | |          | |   (_)      |  _ \\ / __ \\__   __|
      /  \\   __| | __ _  ___| |__  _ ______| |_) | |  | | | |
     / /\\ \\ / _\` |/ _\` |/ __| '_ \\| |______|  _ <| |  | | | |
    / ____ \\ (_| | (_| | (__| | | | |      | |_) | |__| | | |
   /_/    \\_\\__,_|\\__,_|\\___|_| |_|_|      |____/ \\____/  |_|
 
====================================================================`
		console.log( greet );
		
		file.createDir( "database", "root" );
		file.createDir( "logs", "root" );
		
		file.createYAML(
			"cookies",
			{ cookies: [ "米游社Cookies(允许设置多个)" ] }
		);
		file.createYAML(
			"commands",
			{ tips: "此文件修改后需重启应用" }
		);
		file.createYAML( "setting", BotConfig.initObject );
		
		console.log( "环境初始化完成，请在 /config 文件夹中配置信息" );
		process.exit( 0 );
	}
	
	private postUserData( that: Adachi ) {
		const _bot: BOT = that.bot;
		const md5: ( str: string ) => string = str => Md5.init( str );
		const getErrInfo = ( err: AxiosError ) => <string>err.response?.data;
		/*              声明
		 * 此方法仅用于统计的总用户的数量
		 * 所发送的数据中只包含所有用户的 QQ号 的 MD5
		 * Adachi-BOT 不会对任何用户的隐私数据进行收集
		 * */
		return async function() {
			const master: string = md5( _bot.config.master.toString() );
			const bot: string = md5( _bot.config.number.toString() );
			const users: string[] = (
				await _bot.redis.getKeysByPrefix(
				"adachi.user-used-groups"
				)
			).map( key => {
				const userID = <string>key.split( "-" ).pop();
				return md5( userID );
			} );
			
			const t: number = new Date().getTime();
			axios.post( "http://terminal.adachi.top:7665/id/master", { master, bot, t } )
				 .catch( error => _bot.logger.warn( getErrInfo( error ) ) );
			axios.post( "http://terminal.adachi.top:7665/id/users", { users, t } )
				 .catch( error => _bot.logger.warn( getErrInfo( error ) ) );
		}
	}
	
	/* 处理登录事件 */
	private login(): void {
		if ( this.bot.config.qrcode ) {
			/* 扫码登录 */
			this.bot.client.on( "system.login.qrcode", () => {
				this.bot.logger.mark( "手机扫码完成后按下 Enter 继续...\n" );
				process.stdin.once( "data", () => this.bot.client.login() );
			} )
		} else {
			/* 账密登录 */
			this.bot.client.on( "system.login.slider", () => {
				process.stdin.once( "data", ( input: Buffer ) => {
					this.bot.client.sliderLogin( input.toString() );
				} );
			} );
			this.bot.client.on( "system.login.device", () => {
				this.bot.logger.mark( "手机扫码完成后按下 Enter 继续...\n" );
				process.stdin.once( "data", () => this.bot.client.login() );
			} );
			this.bot.client.login( this.bot.config.password );
		}
	}
	
	/* 正则检测处理消息 */
	private async execute(
		messageData: msg.Message,
		sendMessage: msg.SendFunc,
		cmdSet: BasicConfig[],
		limits: string[],
		unionRegExp: RegExp
	): Promise<void> {
		const content: string = messageData.raw_message;
		if ( this.bot.refresh.isRefreshing && !unionRegExp.test( content ) ) {
			return;
		}
		
		const usable: BasicConfig[] = cmdSet.filter( el => !limits.includes( el.cmdKey ) );
		for ( let cmd of usable ) {
			const res: MatchResult = cmd.match( content );
			if ( res.type === "unmatch" ) {
				continue;
			}
			if ( res.type === "order" ) {
				const text: string = cmd.ignoreCase
					? content.toLowerCase() : content;
				messageData.raw_message = trim(
					msg.removeStringPrefix( text, res.header )
					   .replace( / +/g, " " )
				);
			}
			cmd.run( {
				sendMessage, ...this.bot,
				messageData, matchResult: res
			} );
			
			/* 数据统计与收集 */
			const userID: number = messageData.user_id;
			const groupID: number = msg.isGroupMessage( messageData ) ? messageData.group_id : -1;
			await this.bot.redis.addSetMember( `adachi.user-used-groups-${ userID }`, groupID );
			await this.bot.redis.incHash( "adachi.hour-stat", userID.toString(), 1 );
			await this.bot.redis.incHash( "adachi.command-stat", cmd.cmdKey, 1 );
			return;
		}
	}
	
	/* 清除缓存图片 */
	private clearImageCache( that: Adachi ) {
		const bot = that.bot;
		return function () {
			const files: string[] = bot.file.getDirFiles( "data/image", "root" );
			files.forEach( f => {
				const path: string = bot.file.getFilePath(
					`data/image/${ f }`, "root"
				);
				unlinkSync( path );
			} );
			bot.logger.info( "图片缓存已清空" );
		}
	}
	
	/* 处理私聊事件 */
	private parsePrivateMsg( that: Adachi ) {
		const bot = that.bot;
		return async function( messageData: sdk.PrivateMessageEventData ) {
			const userID: number = messageData.user_id;
			if ( !bot.interval.check( userID, -1 ) ) {
				return;
			}
			
			const auth: AuthLevel = await bot.auth.get( userID );
			const limit: string[] = await bot.redis.getList( `adachi.user-command-limit-${ userID }` );
			const sendMessage: msg.SendFunc = bot.message.getSendMessageFunc(
				userID, msg.MessageType.Private
			);
			const cmdSet: BasicConfig[] = bot.command.get( auth, msg.MessageScope.Private );
			const unionReg: RegExp = bot.command.getUnion( auth, msg.MessageScope.Private );
			await that.execute( messageData, sendMessage, cmdSet, limit, unionReg );
		}
	}
	
	/* 处理群聊事件 */
	private parseGroupMsg( that: Adachi ) {
		const bot = that.bot;
		return async function( messageData: sdk.GroupMessageEventData ) {
			const {
				user_id: userID,
				group_id: groupID
			} = messageData;
			if ( !bot.interval.check( userID, groupID ) ) {
				return;
			}
			
			const isBanned: boolean = await bot.redis.existListElement(
				"adachi.banned-group", groupID
			);

			const groupInfo = <sdk.GroupInfo>( await bot.client.getGroupInfo( groupID ) ).data;
			if ( !isBanned && groupInfo.shutup_time_me === 0 ) {
				const auth: AuthLevel = await bot.auth.get( userID );
				const gLim: string[] = await bot.redis.getList( `adachi.group-command-limit-${ groupID }` );
				const uLim: string[] = await bot.redis.getList( `adachi.user-command-limit-${ userID }` );
				const sendMessage: msg.SendFunc = bot.message.getSendMessageFunc(
					userID, msg.MessageType.Group, groupID
				);
				const cmdSet: BasicConfig[] = bot.command.get( auth, msg.MessageScope.Group );
				const unionReg: RegExp = bot.command.getUnion( auth, msg.MessageScope.Group );
				await that.execute( messageData, sendMessage, cmdSet, [ ...gLim, ...uLim ], unionReg );
			}
		}
	}
	
	/* 自动接受入群邀请 */
	private acceptInvite( that: Adachi ) {
		return async function( inviteData: sdk.GroupInviteEventData ) {
			const inviterID: number = inviteData.user_id;
			if ( await that.bot.auth.check( inviterID, that.bot.config.inviteAuth ) ) {
				await that.bot.client.setGroupAddRequest( inviteData.flag );
			} else {
				const groupID: number = inviteData.group_id;
				await that.bot.client.sendPrivateMsg( inviterID, "你没有邀请 BOT 入群的权限" );
				that.bot.logger.info( `用户 ${ inviterID } 尝试邀请 BOT 进入群聊 ${ groupID }` );
			}
		}
	}
	
	/* 自动接受好友申请 */
	private acceptFriend( that: Adachi ) {
		return async function( friendDate: sdk.FriendAddEventData ) {
			await that.bot.client.setFriendAddRequest( friendDate.flag );
		}
	}
	
	/* 数据统计 与 超量使用监看 */
	private hourlyCheck( that: Adachi ): JobCallback {
		const bot = that.bot;
		return function(): void {
			bot.redis.getHash( "adachi.hour-stat" ).then( async data => {
				const cmdOverusedUser: string[] = [];
				const threshold: number = bot.config.countThreshold;
				Object.keys( data ).forEach( key => {
					if ( parseInt( data[key] ) > threshold ) {
						cmdOverusedUser.push( key );
					}
				} );
				
				const length: number = cmdOverusedUser.length;
				if ( length !== 0 ) {
					const msg: string =
						`上个小时内有 ${ length } 个用户指令使用次数超过了阈值` +
						[ "", ...cmdOverusedUser.map( el => `${ el }: ${ data[el] }次` ) ]
							.join( "\n  - " );
					await bot.message.sendMaster( msg );
				}
				await bot.redis.deleteKey( "adachi.hour-stat" );
			} );
			
			bot.redis.getHash( "adachi.command-stat" ).then( async data => {
				const hourID: string = moment().format( "yy/MM/DD/HH" );
				await bot.redis.deleteKey( "adachi.command-stat" );
				await bot.redis.setString( `adachi.command-stat-${ hourID }`, JSON.stringify( data ) );
			} );
		}
	}
}