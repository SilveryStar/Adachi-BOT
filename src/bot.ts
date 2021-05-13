import * as oicq from "oicq";
import { getSendMessageFunc, MessageAllow, MessageType } from "./modules/message";
import { GroupMessageEventData, PrivateMessageEventData } from "oicq";
import { loadYAML } from "./utils/config";
import { readdirSync } from "fs";
import { Plugin } from "./modules/plugin";

let botConfig: any;
let master: number;

let Adachi: oicq.Client;

declare function require( moduleName: string ): any;

function setEnvironment(): void {
	( { botConfig, master } = loadYAML( 'setting' ) );

	/* 创建 bot 实例 */
	Adachi = oicq.createClient( botConfig.number, {
		log_level: "debug"
	} );
	
	/* 处理登录滑动验证码 */
	Adachi.on( "system.login.slider", function () {
		process.stdin.once( "data", function ( input: Buffer ) {
			Adachi.sliderLogin( input.toString() );
		} );
	} );
	
	/* 处理登录图片验证码 */
	Adachi.on( "system.login.captcha", function () {
		process.stdin.once( "data", function ( input: Buffer ) {
			Adachi.sliderLogin( input.toString() );
		} );
	} );
	
	/* 处理设备锁事件 */
	Adachi.on( "system.login.device", function () {
		Adachi.logger.mark( "手机扫码完成后按下 Enter 继续...\n" );
		process.stdin.once( "data", function () {
			Adachi.login();
		} );
	} );
}

function run(): void {
	/* 登录 bot 账号 */
	Adachi.login( botConfig.password );
	
	/* 加载插件 */
	const { groupPlugins, privatePlugins } = loadPlugins();
	
	/* 监听群消息事件，运行群聊插件 */
	Adachi.on( "message.group", function ( messageData: GroupMessageEventData ) {
		let content: string = messageData.raw_message;
		for ( let plugin of groupPlugins ) {
			if ( plugin.match( content ) ) {
				plugin.run( messageData, getSendMessageFunc( messageData.group_id, MessageType.Group ) );
				break;
			}
		}
	} );
	
	/* 监听私聊消息事件，运行私聊插件 */
	Adachi.on( "message.private", function ( messageData: PrivateMessageEventData ) {
		let content: string = messageData.raw_message;
		for ( let plugin of privatePlugins ) {
			if ( plugin.match( content ) ) {
				plugin.run( messageData, getSendMessageFunc( messageData.user_id, MessageType.Private ) );
				break;
			}
		}
	} );
}

function loadPlugins(): any {
	let folder: string[] = readdirSync( "./src/plugins" );
	let groupPlugins = <Array<Plugin>>[];
	let privatePlugins = <Array<Plugin>>[];
	
	/* 从 plugins 文件夹从导入 init.ts 进行插件初始化 */
	for ( let pluginName of folder ) {
		const { init } = require( `../plugins/${ pluginName }/init` );
		const { type, plugins }: { type: MessageAllow, plugins: Plugin[] } = init();
		
		if ( type & MessageAllow.Group ) {
			groupPlugins.push( ...plugins );
		}
		if ( type & MessageAllow.Private ) {
			privatePlugins.push( ...plugins );
		}
	}
	
	return { groupPlugins, privatePlugins };
}

export {
	setEnvironment,
	run,
	Adachi,
	master
}