import * as core from "@/modules/lib";
import { Logger } from "log4js";
import moment from "moment";
import FileManagement from "./file";
import BotConfigManager, { BotConfig } from "./config";
import Database from "./database";
import RenderServer from "./server";
import PluginManager from "./plugin";
import AiChat from "./chat";
import Interval from "./management/interval";
import RefreshConfig from "./management/refresh";
import { BasicRenderer } from "./renderer";
import { Enquire, Order } from "./command";
import Command, { BasicConfig, MatchResult } from "./command/main";
import Authorization, { AuthLevel } from "./management/auth";
import * as msg from "./message";
import MailManagement from "./mail";
import { Md5 } from "md5-typescript";
import { scheduleJob } from "node-schedule";
import { trim } from "lodash";
import { unlinkSync } from "fs";
import axios, { AxiosError } from "axios";
import AssetsUpdate from "@/modules/management/assets";
import process from "process";

/** @interface BOT BOT 工具类 */
export interface BOT {
	/** 数据库实例对象 */
	readonly redis: Database;
	/** 配置文件 */
	readonly config: BotConfig;
	/** 客户端对象 */
	readonly client: core.Client;
	/** 内置日志对象 */
	readonly logger: Logger;
	/** 指令操作限制 */
	readonly interval: Interval;
	/** 文件操作 */
	readonly file: FileManagement;
	/** 权限管理 */
	readonly auth: Authorization;
	/** 消息管理 */
	readonly message: msg.default;
	/** 邮件管理 */
	readonly mail: MailManagement;
	/** 指令集 */
	readonly command: Command;
	/** 图片渲染器 */
	readonly renderer: BasicRenderer;
}

type ScreenSwipeInfo = Record<string, {
	timeout: any,
	massages: number[]
}>

export default class Adachi {
	public readonly bot: BOT;
	private isOnline: boolean = false;
	private deadTimer: NodeJS.Timer | null = null;
	private lastOnline: moment.Moment | null = null;
	/* 收集触发刷屏的用户及消息信息 */
	private screenSwipeInfo: ScreenSwipeInfo = {};
	/* 自动聊天 */
	private readonly aiChat: AiChat;
	
	constructor() {
		/* 初始化运行环境 */
		const file = FileManagement.getInstance();
		/* 是否需要初始化环境 */
		const exist = file.isExistSync( file.getFilePath( "base.yml" ) );
		/* 初始化应用模块 */
		const config = this.getBotConfig();
		/* 初始化命令 */
		const command = new Command( file, config );
		
		if ( !exist ) {
			Adachi.setEnv( file );
		}
		
		const client = core.createClient( config );
		const refresh = RefreshConfig.getInstance();
		
		process.on( "unhandledRejection", ( reason: any ) => {
			client.logger.error( reason?.stack || reason?.message || reason );
		} );
		
		this.aiChat = new AiChat( config.autoChat, client );
		
		const redis = new Database( config.db, client );
		const interval = new Interval( config.directive, redis );
		const auth = new Authorization( config.base, redis );
		const message = new msg.default( config.base, client );
		const mail = new MailManagement( config, client );
		const renderer = new BasicRenderer();
		
		this.bot = {
			client, command, file, redis,
			message, mail, auth, interval,
			config, renderer,
			get logger() {
				return client.logger;
			}
		};
		
		AssetsUpdate.getInstance( this.bot );
		RenderServer.getInstance( config, file, client );
		PluginManager.getInstance( this.bot );
		refresh.register( renderer );
		refresh.register( "commands", command );
	}
	
	public run(): BOT {
		const serverInstance = RenderServer.getInstance();
		const pluginInstance = PluginManager.getInstance();
		// 避免控制台文件下载与插件文件下载冲突
		serverInstance.downloadConsoleDist().then( () => {
			return pluginInstance.load( false );
		} ).then( async pluginSettings => {
			/* 加载插件后再创建服务 */
			await serverInstance.createServer();
			return pluginSettings;
		} ).then( pluginSettings => {
			/* 删除存储的待问答指令 */
			this.bot.redis.deleteKey( Enquire.redisKey ).then();
			/* 成功连接 gocq 后执行各插件装载方法 */
			this.bot.client.connect().then( async () => {
				for ( const key of Object.keys( pluginSettings ) ) {
					await pluginInstance.doMount( key );
				}
			} );
			serverInstance.reloadPluginRouters( pluginInstance.pluginList ).then();
			/* 事件监听 */
			this.bot.client.on( "message.group", this.parseGroupMsg.bind( this ) );
			this.bot.client.on( "message.private", this.parsePrivateMsg.bind( this ) );
			this.bot.client.on( "request.group", this.acceptInvite.bind( this ) );
			this.bot.client.on( "request.friend", this.acceptFriend.bind( this ) );
			this.bot.client.on( "system.online", this.botOnline.bind( this ) );
			this.bot.client.on( "system.offline", this.botOffline.bind( this ) );
			// this.bot.client.on( "notice.friend.decrease", this.friendDecrease( this ) );
			this.bot.client.on( "notice.group.decrease", this.groupDecrease.bind( this ) );
			this.bot.logger.info( "事件监听启动成功" );
		} );
		
		scheduleJob( "0 59 */1 * * *", this.hourlyCheck.bind( this ) );
		scheduleJob( "0 0 4 ? * WED", this.clearImageCache.bind( this ) );
		scheduleJob( "15 58 23 * * *", this.postUserData.bind( this ) );
		
		return this.bot;
	}
	
	private getBotConfig(): BotConfig {
		return <any>( new Proxy( new BotConfigManager(), {
			get( target: BotConfigManager, p: string, receiver: any ) {
				if ( p in target.value ) {
					return target.value[p];
				}
				return target[p];
			}
		} ) );
	}
	
	private static setEnv( file: FileManagement ): void {
		
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
		
		file.createDirSync( "database", "root" );
		file.createDirSync( "logs", "root" );
		
		file.createYAMLSync(
			"commands",
			{ tips: "此文件修改后需重启应用" }
		);
		
		console.log( "环境初始化完成，请在 /config 文件夹中配置信息" );
		process.exit( 0 );
	}
	
	private async postUserData() {
		const bot = this.bot;
		const md5: ( str: string ) => string = str => Md5.init( str );
		const getErrInfo = ( err: AxiosError ) => <string>err.response?.data;
		/*              声明
		 * 此方法仅用于统计的总用户的数量
		 * 所发送的数据中只包含所有用户的 QQ号 的 MD5
		 * Adachi-BOT 不会对任何用户的隐私数据进行收集
		 * */
		const master: string = md5( bot.config.base.master.toString() );
		const uin: string = md5( bot.client.uin.toString() );
		const users: string[] = (
			await bot.redis.getKeysByPrefix(
				"adachi.user-used-groups"
			)
		).map( key => {
			const userID = <string>key.split( "-" ).pop();
			return md5( userID );
		} );
		
		const t: number = new Date().getTime();
		axios.post( "http://terminal.adachi.top:7665/id/master", { master, uin, t } )
			.catch( error => bot.logger.warn( getErrInfo( error ) ) );
		axios.post( "http://terminal.adachi.top:7665/id/users", { users, t } )
			.catch( error => bot.logger.warn( getErrInfo( error ) ) );
	}
	
	/* 校验是否被禁言 */
	private async checkBotShutUp( isPrivate: boolean, groupID: number ) {
		if ( isPrivate ) {
			return false;
		}
		try {
			const groupInfoRes = await this.bot.client.getGroupMemberInfo( groupID, this.bot.client.uin );
			return groupInfoRes.retcode === 0 ? !!groupInfoRes.data.is_shut_up : false;
		} catch {
			return false;
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
		const replyReg = new RegExp( `\\[CQ:reply,id=[\\w=+\-/]+]\\s*(\\[CQ:at,qq=\\d+]\\s*)*` );
		const content: string = messageData.raw_message.replace( replyReg, "" ).trim() || '';
		
		const userID: number = messageData.sender.user_id;
		const groupID: number = msg.isGroupMessage( messageData ) ? messageData.group_id : -1;
		
		// 检查超量使用
		const checkThresholdRes: boolean = await this.checkThreshold( userID );
		if ( !checkThresholdRes ) {
			return;
		}
		
		const refresh = RefreshConfig.getInstance();
		if ( refresh.isRefreshing ) {
			return;
		}
		
		/* 检查是否存在等待回复的 enquire 指令 */
		const curEnquireCmdKey: string = await this.bot.redis.getHashField( Enquire.redisKey, Enquire.getTaskKey( userID, groupID ) );
		if ( curEnquireCmdKey ) {
			const cmd = <Enquire | undefined>this.bot.command.getSingle( curEnquireCmdKey, await this.bot.auth.get( userID ) );
			if ( cmd ) {
				/* 被禁言后不予处理消息 */
				const isShutUp = await this.checkBotShutUp( isPrivate, groupID );
				if ( isShutUp ) {
					return;
				}
				
				const header = cmd.getTask( Enquire.getTaskKey( userID, groupID ) ).header;
				this.setRawMessage( messageData, cmd, content, { header } );
				this.bot.command.cmdRun( async () => {
					await cmd.confirm( userID, groupID, { sendMessage, ...this.bot, messageData } );
				}, userID, groupID );
				return;
			}
		}
		
		/* 未添加好友时不予触发指令 */
		if ( isPrivate && this.bot.config.base.addFriend && messageData.sub_type !== "friend" ) {
			if ( unionRegExp.test( content ) ) {
				await messageData.reply( "请先添加 BOT 为好友再尝试发送指令" );
			}
			return;
		}
		
		/* 人工智障聊天 */
		if ( !unionRegExp.test( content ) ) {
			const enable: boolean = isPrivate || ( !this.bot.config.base.atBOT && isAt );
			if ( this.aiChat.isOpen() && enable ) {
				await this.aiChat.autoChat( messageData.raw_message, sendMessage );
			}
			return;
		}
		
		/* 被禁言后不予处理消息 */
		if ( !isPrivate ) {
			const isShutUp = await this.checkBotShutUp( isPrivate, groupID );
			if ( isShutUp ) {
				return;
			}
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
		/* 选择 最长的 header && 最大的优先级 作为成功匹配项 */
		const { matchResult: res, cmd } = matchList.sort( ( prev, next ) => {
			const getHeaderLength = ( { matchResult }: typeof prev ) => {
				return matchResult.type === "switch"
					? matchResult.switch.length
					: matchResult.header?.length || 0
			}
			return ( getHeaderLength( next ) + next.cmd.priority ) - ( getHeaderLength( prev ) + prev.cmd.priority );
		} )[0];
		
		if ( res.type === "unmatch" ) {
			if ( this.bot.config.directive.matchPrompt ) {
				await sendMessage( `指令参数错误 ~ \n` +
					`你的参数：${ res.param ? res.param : "无" }\n` +
					`参数格式：${ cmd.desc[1] }\n` +
					`参数说明：${ cmd.detail }`
				);
			}
			return;
		}
		
		if ( res.type === "order" || res.type === "enquire" ) {
			this.setRawMessage( messageData, cmd, content, res );
		}
		
		this.bot.command.cmdRun( async () => {
			const input: any = {
				sendMessage, ...this.bot,
				messageData, matchResult: res
			};
			if ( this.bot.command.checkEnquire( cmd ) ) {
				await cmd.activate( userID, groupID, input );
			} else {
				await cmd.run( input );
			}
			/* 数据统计与收集 */
			await this.bot.redis.addSetMember( `adachi.user-used-groups-${ userID }`, groupID.toString() );
			await this.bot.redis.incHash( "adachi.hour-stat", userID.toString(), 1 );
			await this.bot.redis.incHash( "adachi.command-stat", cmd.cmdKey, 1 );
			
			const checkRes: boolean = await this.checkThreshold( userID );
			if ( !checkRes ) {
				/**
				 * 此时该用户已超量
				 * todo 群聊中同时进行回复指定消息
				 */
				await messageData.reply( "指令使用过于频繁，本小时内 BOT 将不再对你的指令作出响应" );
			}
		}, userID, groupID );
		return;
	}
	
	/* 清除缓存图片 */
	private async clearImageCache() {
		const bot = this.bot;
		const files: string[] = await bot.file.getDirFiles( "data/image", "root" );
		files.forEach( f => {
			const path: string = bot.file.getFilePath(
				`data/image/${ f }`, "root"
			);
			unlinkSync( path );
		} );
		bot.logger.info( "图片缓存已清空" );
	}
	
	private setRawMessage<T extends {
		header: string
	}>( messageData: msg.Message, cmd: BasicConfig, content: string, result: T ) {
		const text: string = cmd.ignoreCase ? content.toLowerCase() : content;
		messageData.raw_message = trim(
			msg.removeStringPrefix( text, result.header.toLowerCase() )
				.replace( / +/g, " " )
		);
	}
	
	/* 处理私聊事件 */
	private async parsePrivateMsg( messageData: core.PrivateMessageEvent ) {
		const bot = this.bot;
		const userID: number = messageData.sender.user_id;
		const isMaster = userID === bot.config.base.master;
		
		/* 白名单校验 */
		if ( !isMaster && bot.config.whiteList.enable && !this.userValid( userID ) ) {
			return;
		}
		
		if ( !bot.interval.check( userID, "private" ) ) {
			return;
		}
		
		const auth: AuthLevel = await bot.auth.get( userID );
		const limit: string[] = await bot.redis.getList( `adachi.user-command-limit-${ userID }` );
		const sendMessage: msg.SendFunc = bot.message.getSendMessageFunc(
			userID, msg.MessageType.Private
		);
		const cmdSet: BasicConfig[] = bot.command.get( auth, msg.MessageScope.Private );
		const unionReg: RegExp = bot.command.getUnion( auth, msg.MessageScope.Private );
		await this.execute( messageData, sendMessage, cmdSet, limit, unionReg, true, false );
	}
	
	/* 处理群聊事件 */
	private async parseGroupMsg( messageData: core.GroupMessageEvent ) {
		const bot = this.bot;
		const isAt = this.checkAtBOT( messageData );
		if ( bot.config.base.atBOT && !isAt ) {
			return;
		}
		
		const { sender: { user_id: userID }, group_id: groupID, message_id: messageID, message } = messageData;
		const isMaster = userID === bot.config.base.master;
		
		/* 白名单校验 */
		if ( !isMaster && bot.config.whiteList.enable && !this.groupValid( groupID, userID ) ) {
			return;
		}
		
		/* 开启禁止刷屏模式 */
		if ( bot.config.banScreenSwipe.enable ) {
			this.banScreenSwipe( userID, groupID, messageID );
		}
		
		/* 开启禁止过量 at 模式 */
		if ( bot.config.banHeavyAt.enable ) {
			this.banHeavyAt( userID, groupID, messageID, message );
		}
		
		if ( !bot.interval.check( groupID, "group" ) ) {
			return;
		}
		
		const isBanned: boolean = await bot.redis.existListElement(
			"adachi.banned-group", groupID
		);
		
		if ( !isBanned ) {
			const auth: AuthLevel = await bot.auth.get( userID );
			const gLim: string[] = await bot.redis.getList( `adachi.group-command-limit-${ groupID }` );
			const uLim: string[] = await bot.redis.getList( `adachi.user-command-limit-${ userID }` );
			const sendMessage: msg.SendFunc = bot.message.getSendMessageFunc(
				userID, msg.MessageType.Group, groupID
			);
			const cmdSet: BasicConfig[] = bot.command.get( auth, msg.MessageScope.Group );
			const unionReg: RegExp = bot.command.getUnion( auth, msg.MessageScope.Group );
			await this.execute( messageData, sendMessage, cmdSet, [ ...gLim, ...uLim ], unionReg, false, isAt );
		}
	}
	
	private userValid( userId: number ): boolean {
		const userList = this.bot.config.whiteList.user;
		/* 列表内无账号，不限制使用 */
		if ( userList.length === 0 ) {
			return true;
		}
		return userList.includes( userId );
	}
	
	/* 群组白名单校验 */
	private groupValid( groupId: number, userId: number ): boolean {
		if ( !this.userValid( userId ) ) {
			return false;
		}
		const groupList = this.bot.config.whiteList.group;
		/* 列表内无账号，不限制使用 */
		if ( groupList.length === 0 ) {
			return true;
		}
		return groupList.includes( groupId );
	}
	
	// 检测超量使用
	private async checkThreshold( userID: number ): Promise<boolean> {
		const thresholdInterval: boolean = this.bot.config.directive.ThresholdInterval;
		if ( !thresholdInterval ) return true;
		
		// 当需要超量禁用时，进行处理
		const threshold: number = this.bot.config.directive.countThreshold;
		const dbKey: string = "adachi.hour-stat";
		const data = await this.bot.redis.getHash( dbKey );
		
		const userThresholdCount: number = Number.parseInt( data[userID] ) || 0;
		return userThresholdCount <= threshold;
	}
	
	/* 处理刷屏用户 */
	private banScreenSwipe( userID: number, groupID: number, messageID: number ) {
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
				...massages.map( msgID => this.bot.client.recallMessage( msgID ) ),
				this.bot.client.setGroupBan( groupID, userID, config.duration )
			];
			
			if ( config.prompt ) {
				promiseList.push(
					this.bot.client.sendGroupMsg( groupID, [
						core.segment.at( userID ), " ", config.promptMsg
					] )
				)
			}
			
			Promise.all( promiseList ).finally( () => {
				resolve();
			} );
		} )
	}
	
	/* 处理过量at用户 */
	private banHeavyAt( userID: number, groupID: number, messageID: number, message: core.MessageRecepElem[] ) {
		const config = this.bot.config.banHeavyAt;
		
		const atNums = message.filter( msg => msg.type === "at" ).length;
		if ( atNums > config.limit ) {
			const promiseList: Promise<any>[] = [
				this.bot.client.recallMessage( messageID ),
				this.bot.client.setGroupBan( groupID, userID, config.duration )
			];
			if ( config.prompt ) {
				promiseList.push(
					this.bot.client.sendGroupMsg( groupID, [ core.segment.at( userID ), " ", config.promptMsg ] )
				);
			}
			Promise.all( promiseList ).then();
		}
	}
	
	private checkAtBOT( msg: core.GroupMessageEvent ): boolean {
		if ( msg.atMe ) {
			const atBotReg = new RegExp( `\\[CQ:at,type=at,qq=${ this.bot.client.uin }.*?]` );
			msg.raw_message = msg.raw_message
				.replace( atBotReg, "" )
				.trim();
			return true;
		}
		return false;
	}
	
	/* 自动接受入群邀请 */
	private async acceptInvite( data: core.GroupRequestEvent ) {
		const bot = this.bot;
		if ( data.sub_type === "add" ) {
			return;
		}
		const inviterID: number = data.user_id;
		if ( await bot.auth.check( inviterID, bot.config.base.inviteAuth ) ) {
			const delay = Math.random() * ( 5 - 2 ) + 2;
			setTimeout( async () => {
				data.approve( true );
			}, Math.floor( delay * 1000 ) );
		} else {
			const groupID: number = data.group_id;
			await bot.client.sendPrivateMsg( data.user_id, "你没有邀请 BOT 入群的权限" );
			bot.logger.info( `用户 ${ inviterID } 尝试邀请 BOT 进入群聊 ${ groupID }` );
		}
	}
	
	/* 自动接受好友申请 */
	private async acceptFriend( friendDate: core.FriendRequestEvent ) {
		const delay = Math.random() * ( 5 - 2 ) + 2;
		setTimeout( async () => {
			friendDate.approve( true );
		}, Math.floor( delay * 1000 ) );
	}
	
	/* 上线事件 */
	private async botOnline() {
		const bot = this.bot;
		if ( this.deadTimer ) {
			clearTimeout( this.deadTimer );
			this.deadTimer = null;
		}
		
		if ( this.lastOnline ) {
			this.lastOnline = null;
		}
		
		if ( this.isOnline ) return;
		
		this.isOnline = true;
		
		const HELP = <Order>bot.command.getSingle( "adachi.help", AuthLevel.Master );
		const message: string =
			`Adachi-BOT 已启动成功，请输入 ${ HELP.getHeaders()[0] } 查看命令帮助\n` +
			"如有问题请前往 github.com/SilveryStar/Adachi-BOT 进行反馈"
		await this.bot.message.sendMaster( message );
	}
	
	/* 离线事件 */
	private async botOffline() {
		const bot = this.bot;
		if ( !bot.config.mail.logoutSend || this.deadTimer ) return;
		
		if ( !this.lastOnline ) {
			this.lastOnline = moment();
		}
		
		const { sendDelay, retry, retryWait } = bot.config.mail;
		this.deadTimer = setTimeout( () => {
			const lastTime: string = this.lastOnline!.format( "YYYY-MM-DD HH:mm:ss" );
			bot.mail.sendMaster( {
				subject: "BOT 已离线",
				html: `<p>BOT已离线，上次在线时间：${ lastTime }，请前往日志查看并重启BOT</p>
						<div align="center">
						    <img src="https://docs.adachi.top/images/adachi.png" width="200"/>
						    <h3>- AdachiBOT -</h3>
						    <div>
						        <a href="https://docs.adachi.top" target="_blank">官方文档</a> &nbsp;|&nbsp;
						        <a href="https://github.com/SilveryStar/Adachi-Plugin" target="_blank">插件库</a> &nbsp;|&nbsp;
						        <a href="https://github.com/SilveryStar/Adachi-BOT/issues/146">关于频道</a>
						    </div>
						    <small>&gt; 原神Q群助手 &lt;</small>
						</div>`
			}, retry, retryWait * 60 * 1000 );
		}, sendDelay * 60 * 1000 );
	}
	
	/**
	 * 删除好友事件
	 * todo gocq 未直接支持删除好友事件，后续补充
	 */
	// private friendDecrease( that: Adachi ) {
	// 	const bot = that.bot
	// 	return async function ( friendDate: sdk.FriendDecreaseEvent ) {
	// 		if ( bot.config.base.addFriend ) {
	// 			const userId = friendDate.user_id;
	// 			// 清空订阅
	// 			PluginManager.getInstance().remSub( "private", userId );
	// 		}
	// 	}
	// }
	
	/* 退群事件 */
	private groupDecrease( groupDate: core.GroupDecreaseNoticeEvent ) {
		if ( this.bot.config.base.addFriend ) {
			const groupId = groupDate.group_id;
			// 清空订阅
			PluginManager.getInstance().remSub( "group", groupId );
		}
	}
	
	/* 数据统计 与 超量使用监看 */
	private async hourlyCheck() {
		const bot = this.bot;
		bot.redis.getHash( "adachi.hour-stat" ).then( async data => {
			const threshold: number = bot.config.directive.countThreshold;
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