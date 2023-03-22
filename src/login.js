const { readFileSync } = require( "fs" );
const { parse } = require( "yaml" );
const { createClient } = require( "icqq" );
const { resolve } = require( "path" );

( function() {
	const file = readFileSync( resolve( __dirname, "../config/setting.yml" ), "utf-8" );
	const setting = parse( file );
	const bot = createClient();
	
	// 处理登录滑动验证码
	bot.on( "system.login.slider", () => {
		process.stdin.once( "data", ( input ) => {
			bot.sliderLogin( input.toString() );
		} );
	} );
	
	// 处理设备锁事件
	bot.on( "system.login.device", () => {
		bot.logger.info( "手机扫码完成后按下 Enter 继续..." );
		process.stdin.once( "data", () => {
			bot.login();
		} );
	} );
	
	bot.login( setting.number, setting.password );
} )();