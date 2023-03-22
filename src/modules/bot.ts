import * as sdk from "icqq";
import * as log from "log4js";
import moment from "moment";
import BotConfig from "./config";
import Database from "./database";
import Interval from "./management/interval";
import FileManagement from "./file";
import Plugin, { PluginReSubs } from "./plugin";
import WebConfiguration from "./logger";
import WebConsole from "@web-console/backend";
import RefreshConfig from "./management/refresh";
import { Order } from "./command";
import { BasicRenderer } from "@modules/renderer";
import Command, { BasicConfig, MatchResult } from "./command/main";
import Authorization, { AuthLevel } from "./management/auth";
import MsgManagement, * as msg from "./message";
import MailManagement from "./mail";

;
import { Md5 } from "md5-typescript";
import { Job, JobCallback, scheduleJob } from "node-schedule";
import { trim } from "lodash";
import { unlinkSync } from "fs";
import axios, { AxiosError } from "axios";
import AiChat from "@modules/chat";
import { WhiteList } from "@modules/whitelist";

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
 * @renderer 渲染器
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
	readonly mail: MailManagement;
	readonly command: Command;
	readonly whitelist: WhiteList;
	readonly refresh: RefreshConfig;
	readonly renderer: BasicRenderer;
}

type ScreenSwipeInfo = Record<string, {
	timeout: any,
	massages: string[]
}>

export default class Adachi {
	public readonly bot: BOT;
	private isOnline: boolean = false;
	private deadTimer: NodeJS.Timer | null = null;
	/* 收集触发刷屏的用户及消息信息 */
	private screenSwipeInfo: ScreenSwipeInfo = {};
	/* 自动聊天 */
	private readonly aiChat: AiChat | null = null;
	
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
		
		const client = sdk.createClient( {
			log_level: config.logLevel,
			platform: config.platform,
			ffmpeg_path: config.ffmpegPath,
			ffprobe_path: config.ffprobePath
			// ffmpeg_path: "D:\\Tools\\ffmpeg\\bin\\ffmpeg.exe",
			// ffprobe_path: "D:\\Tools\\ffmpeg\\bin\\ffprobe.exe",
		} );
		const logger = client.logger;
		process.on( "unhandledRejection", reason => {
			logger.error( ( <Error>reason ).stack || ( <Error>reason ).message );
		} );
		
		if ( config.autoChat.enable ) {
			this.aiChat = new AiChat( config.autoChat, logger );
		}
		
		const redis = new Database( config.dbPort, config.dbPassword, logger, file );
		const interval = new Interval( config, redis );
		const auth = new Authorization( config, redis );
		const message = new MsgManagement( config, client );
		const mail = new MailManagement( config, logger );
		const command = new Command( file );
		const refresh = new RefreshConfig( file, command );
		const whitelist = new WhiteList( file );
		const renderer = new BasicRenderer();
		
		this.bot = {
			client, command, file, redis,
			logger, message, mail, auth,
			interval, config, refresh, renderer,
			whitelist
		};
		refresh.registerRefreshableFile( "whitelist", whitelist );
		refresh.registerRefreshableFunc( renderer );
	}
	
	public run(): BOT {
		this.login();
		Plugin.load( this.bot ).then( commands => {
			this.bot.command.add( commands );
			/* 事件监听 */
			this.bot.client.on( "message.group", this.parseGroupMsg( this ) );
			this.bot.client.on( "message.private", this.parsePrivateMsg( this ) );
			this.bot.client.on( "request.group", this.acceptInvite( this ) );
			this.bot.client.on( "request.friend", this.acceptFriend( this ) );
			this.bot.client.on( "system.online", this.botOnline( this ) );
			this.bot.client.on( "system.offline", this.botOffline( this ) );
			this.bot.client.on( "notice.friend.decrease", this.friendDecrease( this ) );
			this.bot.logger.info( "事件监听启动成功" );
		} );
		
		scheduleJob( "0 59 */1 * * *", this.hourlyCheck( this ) );
		scheduleJob( "0 0 4 ? * WED", this.clearImageCache( this ) );
		scheduleJob( "15 58 23 * * *", this.postUserData( this ) );
		
		return this.bot;
	}
	
	private static setEnv( file: FileManagement ): void {
		file.createDir( "config", "root" );
		const exist: boolean = file.createYAML( "setting", BotConfig.initObject );
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
		return async function () {
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
	
	/* 扫码登陆 */
	private qrcodeLogin() {
		this.bot.logger.mark( "请在2分钟内完成扫描码登录(或在完成扫码后按下Enter继续)...\n" );
		const d = new Date();
		const job: Job = scheduleJob( d.setMinutes( d.getMinutes() + 2 ), async () => {
			this.bot.client.login();
		} );
		
		/* 兼容终端输入 */
		process.stdin.once( "data", () => {
			this.bot.client.login();
			job.cancel();
		} );
	}
	
	/* 处理登录事件 */
	private login(): void {
		/* 处理滑动验证码事件 */
		this.bot.client.on( "system.login.slider", () => {
			const number = this.bot.config.number;
			this.bot.logger.mark( `请在5分钟内完成滑动验证,并将获取到的ticket写入到src/data/${ number }/ticket.txt文件中并保存（亦可通过控制台-其他配置进行写入），或在终端粘贴获取到的ticket，不要重启服务!!!` );
			const d = new Date();
			// 创建空的ticket.txt
			const dirName = `src/data/${ number }`;
			const ticketPath = `${ dirName }/ticket.txt`;
			this.bot.file.createDir( dirName, "root", true );
			this.bot.file.createFile( ticketPath, "", "root" );
			
			// 定时去查看ticket文件是否已写入ticket
			const job: Job = scheduleJob( "0/5 * * * * *", () => {
				if ( d.setMinutes( d.getMinutes() + 5 ) > d.getTime() ) {
					this.bot.logger.warn( "已超过5分钟了，请重新登录" )
					job.cancel();
					return;
				}
				const file = this.bot.file.loadFile( ticketPath, "root" );
				if ( file && file.trim() ) {
					this.bot.client.sliderLogin( file.trim() );
					job.cancel();
					this.bot.file.writeFile( ticketPath, "", "root" );
				}
			} )
			
			/* 兼容终端输入 */
			process.stdin.once( "data", ( input ) => {
				this.bot.client.sliderLogin( input.toString() );
				job.cancel();
			} );
		} );
		/* 处理设备锁事件 */
		this.bot.client.on( "system.login.device", ( { phone } ) => {
			if ( phone ) {
				const number = this.bot.config.number;
				this.bot.logger.mark( `请在5分钟内将获取到的短信验证码写入到src/data/${ number }/code.txt文件中并保存（亦可通过控制台-其他配置进行写入），或在终端粘贴获取到的code，不要重启服务!!!` );
				this.bot.client.sendSmsCode();
				const d = new Date();
				// 创建空的code.txt
				const dirName = `src/data/${ number }`;
				const codePath = `${ dirName }/code.txt`;
				this.bot.file.createDir( dirName, "root", true );
				this.bot.file.createFile( codePath, "", "root" );
				
				// 定时去查看ticket文件是否已写入ticket
				const job: Job = scheduleJob( "0/5 * * * * *", () => {
					if ( d.setMinutes( d.getMinutes() + 5 ) > d.getTime() ) {
						this.bot.logger.warn( "已超过5分钟了，请重新登录" )
						job.cancel();
						return;
					}
					const file: string = this.bot.file.loadFile( codePath, "root" );
					if ( file && file.trim() ) {
						this.bot.client.submitSMSCode( file.trim() );
						job.cancel();
						this.bot.file.writeFile( codePath, "", "root" );
					}
				} )
				
				/* 兼容终端输入 */
				process.stdin.once( "data", ( input ) => {
					this.bot.client.submitSMSCode( input.toString() );
					job.cancel();
				} );
			} else {
				this.qrcodeLogin();
			}
		} );
		if ( this.bot.config.qrcode ) {
			/* 扫码登录 */
			this.bot.client.on( "system.login.qrcode", () => {
				this.qrcodeLogin();
			} );
			this.bot.client.login();
		} else {
			/* 账密登录 */
			this.bot.client.login( this.bot.config.number, this.bot.config.password );
		}
	}
	
	/* 正则检测处理消息 */
	private async execute(
		messageData: msg.Message,
		sendMessage: msg.SendFunc,
		cmdSet: BasicConfig[],
		limits: string[],
		unionRegExp: RegExp,
		isPrivate: boolean,
		isAt: boolean
	): Promise<void> {
		// 群组内的回复消息会at被回复的用户，需要把这个内容也去掉
		const replyReg = new RegExp( `\\[CQ:reply,id=[\\w=+/]+]\\s*(\\[CQ:at,type=at,qq=\\d+,text=.*])?` );
		
		let content: string = messageData.toCqcode().replace( replyReg, "" ).trim() || '';
		
		if ( this.bot.refresh.isRefreshing ) {
			return;
		}
		
		if ( isPrivate && this.bot.config.addFriend && messageData.sub_type !== "friend" ) {
			if ( unionRegExp.test( content ) ) {
				await messageData.reply( "请先添加 BOT 为好友再尝试发送指令" );
			}
			return;
		}
		
		/* 人工智障聊天 */
		if ( !unionRegExp.test( content ) ) {
			const enable: boolean = isPrivate || ( !this.bot.config.atBOT && isAt );
			if ( this.aiChat && enable ) {
				await this.aiChat.autoChat( messageData.raw_message, sendMessage );
			}
			return;
		}
		
		const usable: BasicConfig[] = cmdSet.filter( el => !limits.includes( el.cmdKey ) );
		const matchList: { matchResult: MatchResult; cmd: BasicConfig }[] = [];
		
		for ( let cmd of usable ) {
			const res: MatchResult = cmd.match( content );
			if ( res.type === "unmatch" ) {
				if ( res.missParam && res.header ) {
					matchList.push( { matchResult: res, cmd } );
				}
				continue;
			}
			matchList.push( { matchResult: res, cmd } )
		}
		
		if ( matchList.length === 0 ) return;
		/* 选择最长的 header 作为成功匹配项 */
		const { matchResult: res, cmd } = matchList.sort( ( prev, next ) => {
			const getHeaderLength = ( { matchResult }: typeof prev ) => {
				let length: number = 0;
				if ( matchResult.type === "unmatch" || matchResult.type === "order" ) {
					length = matchResult.header ? matchResult.header.length : 0;
				} else if ( matchResult.type === "switch" ) {
					length = matchResult.switch.length;
				} else {
					length = 233;
				}
				return length;
			}
			return getHeaderLength( next ) - getHeaderLength( prev );
		} )[0];
		
		if ( res.type === "unmatch" ) {
			if ( this.bot.config.matchPrompt ) {
				await sendMessage( `指令参数错误 ~ \n` +
					`你的参数：${ res.param ? res.param : "无" }\n` +
					`参数格式：${ cmd.desc[1] }\n` +
					`参数说明：${ cmd.detail }`
				);
			}
			return;
		}
		
		if ( res.type === "order" ) {
			const text: string = cmd.ignoreCase
				? content.toLowerCase() : content;
			messageData.raw_message = trim(
				msg.removeStringPrefix( text, res.header.toLowerCase() )
					.replace( / +/g, " " )
			);
		}
		cmd.run( {
			sendMessage, ...this.bot,
			messageData, matchResult: res
		} );
		
		/* 数据统计与收集 */
		const userID: number = messageData.sender.user_id;
		const groupID: number = msg.isGroupMessage( messageData ) ? messageData.group_id : -1;
		
		await this.bot.redis.addSetMember( `adachi.user-used-groups-${ userID }`, groupID );
		await this.bot.redis.incHash( "adachi.hour-stat", userID.toString(), 1 );
		await this.bot.redis.incHash( "adachi.command-stat", cmd.cmdKey, 1 );
		
		const checkRes: boolean = await this.checkThreshold( userID );
		if ( !checkRes ) {
			// 此时该用户已超量
			await messageData.reply( "指令使用过于频繁，本小时内 BOT 将不再对你的指令作出响应", groupID !== -1 );
		}
		
		return;
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
		return async function ( messageData: sdk.PrivateMessageEvent ) {
			const userID: number = messageData.from_id;
			const isMaster = userID === bot.config.master;
			
			/* 白名单校验 */
			if ( !isMaster && bot.config.useWhitelist && !bot.whitelist.userValid( userID ) ) {
				return;
			}
			
			if ( !bot.interval.check( userID, "private" ) ) {
				return;
			}
			
			// 检查超量使用
			const checkThresholdRes: boolean = await that.checkThreshold( userID );
			if ( !checkThresholdRes ) {
				return;
			}
			
			const auth: AuthLevel = await bot.auth.get( userID );
			const limit: string[] = await bot.redis.getList( `adachi.user-command-limit-${ userID }` );
			const sendMessage: msg.SendFunc = bot.message.getSendMessageFunc(
				userID, msg.MessageType.Private
			);
			const cmdSet: BasicConfig[] = bot.command.get( auth, msg.MessageScope.Private );
			const unionReg: RegExp = bot.command.getUnion( auth, msg.MessageScope.Private );
			await that.execute( messageData, sendMessage, cmdSet, limit, unionReg, true, false );
		}
	}
	
	/* 处理群聊事件 */
	private parseGroupMsg( that: Adachi ) {
		const bot = that.bot;
		return async function ( messageData: sdk.GroupMessageEvent ) {
			const isAt = that.checkAtBOT( messageData );
			if ( bot.config.atBOT && !isAt ) {
				return;
			}
			
			const { sender: { user_id: userID }, group_id: groupID, message_id: messageID, message } = messageData;
			const isMaster = userID === bot.config.master;
			
			/* 白名单校验 */
			if ( !isMaster && bot.config.useWhitelist && !bot.whitelist.groupValid( groupID, userID ) ) {
				return;
			}
			
			/* 开启禁止刷屏模式 */
			if ( bot.config.banScreenSwipe.enable ) {
				that.banScreenSwipe( userID, groupID, messageID );
			}
			
			/* 开启禁止过量 at 模式 */
			if ( bot.config.banHeavyAt.enable ) {
				that.banHeavyAt( userID, groupID, messageID, message );
			}
			
			if ( !bot.interval.check( groupID, "group" ) ) {
				return;
			}
			
			// 检查超量使用
			const checkThresholdRes: boolean = await that.checkThreshold( userID );
			if ( !checkThresholdRes ) {
				return;
			}
			
			const isBanned: boolean = await bot.redis.existListElement(
				"adachi.banned-group", groupID
			);
			
			const groupInfo: sdk.GroupInfo = await bot.client.getGroupInfo( groupID );
			if ( !isBanned && groupInfo.shutup_time_me === 0 ) {
				const auth: AuthLevel = await bot.auth.get( userID );
				const gLim: string[] = await bot.redis.getList( `adachi.group-command-limit-${ groupID }` );
				const uLim: string[] = await bot.redis.getList( `adachi.user-command-limit-${ userID }` );
				const sendMessage: msg.SendFunc = bot.message.getSendMessageFunc(
					userID, msg.MessageType.Group, groupID
				);
				const cmdSet: BasicConfig[] = bot.command.get( auth, msg.MessageScope.Group );
				const unionReg: RegExp = bot.command.getUnion( auth, msg.MessageScope.Group );
				await that.execute( messageData, sendMessage, cmdSet, [ ...gLim, ...uLim ], unionReg, false, isAt );
			}
		}
	}
	
	// 检测超量使用
	private async checkThreshold( userID: number ): Promise<boolean> {
		const thresholdInterval: boolean = this.bot.config.ThresholdInterval;
		if ( !thresholdInterval ) return true;
		
		// 当需要超量禁用时，进行处理
		const threshold: number = this.bot.config.countThreshold;
		const dbKey: string = "adachi.hour-stat";
		const data = await this.bot.redis.getHash( dbKey );
		
		const userThresholdCount: number = Number.parseInt( data[userID] ) || 0;
		return userThresholdCount <= threshold;
	}
	
	/* 处理刷屏用户 */
	private banScreenSwipe( userID: number, groupID: number, messageID: string ) {
		const config = this.bot.config.banScreenSwipe;
		
		const userMark: string = `${ userID }-${ groupID }`;
		if ( !this.screenSwipeInfo[userMark] ) {
			this.screenSwipeInfo[userMark] = {
				massages: [],
				timeout: null
			};
		}
		const cUserMark = this.screenSwipeInfo[userMark];
		cUserMark.massages.push( messageID );
		
		if ( cUserMark.timeout ) {
			clearTimeout( cUserMark.timeout );
			cUserMark.timeout = null;
		}
		cUserMark.timeout = setTimeout( async () => {
			if ( cUserMark.massages.length > config.limit ) {
				this.banScreenSwipeHandle( userMark, cUserMark ).then( () => {
					Reflect.deleteProperty( this.screenSwipeInfo, userMark );
					clearTimeout( cUserMark.timeout );
					cUserMark.timeout = null;
				} )
			} else {
				Reflect.deleteProperty( this.screenSwipeInfo, userMark );
				clearTimeout( cUserMark.timeout );
				cUserMark.timeout = null;
			}
		}, 1000 );
	}
	
	/* 处理刷屏用户具体实现 */
	private banScreenSwipeHandle( userGroupId: string, { massages }: ScreenSwipeInfo[string] ): Promise<void> {
		return new Promise( resolve => {
			const config = this.bot.config.banScreenSwipe;
			
			const idInfo = userGroupId.split( "-" );
			const userID = Number.parseInt( idInfo[0] );
			const groupID = Number.parseInt( idInfo[1] );
			
			const promiseList: Promise<any>[] = [
				...massages.map( msgID => this.bot.client.deleteMsg( msgID ) ),
				this.bot.client.setGroupBan( groupID, userID, config.duration )
			];
			
			if ( config.prompt ) {
				promiseList.push(
					this.bot.client.pickGroup( groupID ).sendMsg( [ sdk.segment.at( userID ), " ", config.promptMsg ] )
				)
			}
			
			Promise.all( promiseList ).finally( () => {
				resolve();
			} );
		} )
	}
	
	/* 处理过量at用户 */
	private banHeavyAt( userID: number, groupID: number, messageID: string, message: sdk.MessageElem[] ) {
		const config = this.bot.config.banHeavyAt;
		
		const atNums = message.filter( msg => msg.type === "at" ).length;
		if ( atNums > config.limit ) {
			const promiseList: Promise<any>[] = [
				this.bot.client.deleteMsg( messageID ),
				this.bot.client.setGroupBan( groupID, userID, config.duration )
			];
			if ( config.prompt ) {
				promiseList.push(
					this.bot.client.pickGroup( groupID ).sendMsg( [ sdk.segment.at( userID ), " ", config.promptMsg ] )
				);
			}
			Promise.all( promiseList ).then();
		}
	}
	
	private checkAtBOT( msg: sdk.GroupMessageEvent ): boolean {
		const { number } = this.bot.config;
		if ( msg.atme ) {
			const atBotReg = new RegExp( `\\[CQ:at,type=at,qq=${number}.*?]` );
			msg.raw_message = msg.toCqcode()
				.replace( atBotReg, "" )
				.trim();
			return true;
		}
		return false;
	}
	
	/* 自动接受入群邀请 */
	private acceptInvite( that: Adachi ) {
		const bot = that.bot;
		return async function ( data: sdk.GroupInviteEvent | sdk.GroupRequestEvent ) {
			if ( data.sub_type === "add" ) {
				return;
			}
			const inviterID: number = data.user_id;
			if ( await bot.auth.check( inviterID, bot.config.inviteAuth ) ) {
				const delay = Math.random() * ( 5 - 2 ) + 2;
				setTimeout( async () => {
					await bot.client.setGroupAddRequest( data.flag );
				}, Math.floor( delay * 1000 ) );
			} else {
				const groupID: number = data.group_id;
				await bot.client.pickUser( inviterID ).sendMsg( "你没有邀请 BOT 入群的权限" );
				bot.logger.info( `用户 ${ inviterID } 尝试邀请 BOT 进入群聊 ${ groupID }` );
			}
		}
	}
	
	/* 自动接受好友申请 */
	private acceptFriend( that: Adachi ) {
		return async function ( friendDate: sdk.FriendRequestEvent ) {
			const delay = Math.random() * ( 5 - 2 ) + 2;
			setTimeout( async () => {
				await that.bot.client.setFriendAddRequest( friendDate.flag );
			}, Math.floor( delay * 1000 ) );
		}
	}
	
	/* 上线事件 */
	private botOnline( that: Adachi ) {
		const bot = that.bot;
		return async function () {
			if ( that.deadTimer ) {
				clearTimeout( that.deadTimer );
				that.deadTimer = null;
			}
			if ( that.isOnline ) {
				return;
			}
			that.isOnline = true;
			const HELP = <Order>bot.command.getSingle( "adachi.help", AuthLevel.Master );
			const message: string =
				`Adachi-BOT 已启动成功，请输入 ${ HELP.getHeaders()[0] } 查看命令帮助\n` +
				"如有问题请前往 github.com/SilveryStar/Adachi-BOT 进行反馈"
			await that.bot.message.sendMaster( message );
		}
	}
	
	/* 离线事件 */
	private botOffline( that: Adachi ) {
		const bot = that.bot;
		return async function () {
			if ( !bot.config.mailConfig.logoutSend ) {
				return;
			}
			const sendDelay: number = bot.config.mailConfig.sendDelay;
			that.deadTimer = setTimeout( () => {
				bot.mail.sendMaster( "BOT 已离线", `BOT已离线${ sendDelay }分钟，请前往日志查看并重启BOT` );
			}, sendDelay * 60 * 1000 );
		}
	}
	
	/* 删除好友事件 */
	private friendDecrease( that: Adachi ) {
		const bot = that.bot
		return async function ( friendDate: sdk.FriendDecreaseEvent ) {
			if ( bot.config.addFriend ) {
				const userId = friendDate.user_id;
				for ( const plugin in PluginReSubs ) {
					try {
						await PluginReSubs[plugin].reSub( userId, bot );
					} catch ( error ) {
						bot.logger.error( `插件${ plugin }取消订阅事件执行异常：${ <string>error }` )
					}
				}
			}
		}
	}
	
	/* 数据统计 与 超量使用监看 */
	private hourlyCheck( that: Adachi ): JobCallback {
		const bot = that.bot;
		return function (): void {
			bot.redis.getHash( "adachi.hour-stat" ).then( async data => {
				const threshold: number = bot.config.countThreshold;
				const cmdOverusedUser: string[] = Object.keys( data ).filter( key => {
					return parseInt( data[key] ) > threshold;
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