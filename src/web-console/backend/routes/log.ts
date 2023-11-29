import express from "express";
import bot from "ROOT";
import { RequestParamsError } from "@/web-console/backend/utils/error";

export default express.Router().get( "/", async ( req, res, next ) => {
	const page = parseInt( <string>req.query.page ); // 当前第几页
	const length = parseInt( <string>req.query.length ); // 页长度
	const logLevel = <string>req.query.logLevel; // 日志等级
	const msgType = parseInt( <string>req.query.msgType ); // 消息类型 0：系统 1: 私聊 2: 群聊
	const groupId = <string>req.query.groupId; // 群号，仅 msgType 为 2 时可用
	const utcDiffer = 8 * 60 * 60 * 1000;
	const date = new Date( parseInt( <string>req.query.date ) + utcDiffer ).toJSON();  // 日期时间戳
	
	if ( !page || !length || !date ) {
		return next( new RequestParamsError() );
	}
	
	const fileName: string = `logs/bot.${ date.split( "T" )[0] }.log`;
	const path: string = bot.file.getFilePath( fileName, "root" );
	
	try {
		if ( await bot.file.isExist( path ) ) {
			const fileBuffer = await bot.file.loadFileByStream( fileName, bot.config.webConsole.logHighWaterMark, "root" );
			if ( !fileBuffer ) {
				return res.status( 500 ).send( { code: 500, data: {}, msg: "读取日志文件失败" } );
			}
			const file = fileBuffer.toString( "utf-8" );
			const fullData = file.split( /[\n\r]/g ).filter( el => el.length !== 0 );
			const respData = fullData
				.map( el => JSON.parse( el ) )
				.filter( el => {
					/* 过滤日志等级 */
					if ( logLevel && el.level !== logLevel.toUpperCase() ) {
						return false;
					}
					/* 过滤消息类型 */
					if ( !Number.isNaN( msgType ) ) {
						const reg = /^(?:send to|recv from): \[(Group|Private): .*?(\d+)/;
						const result = reg.exec( el.message );
						if ( result ) {
							const type = <'Group' | 'Private'>result[1];
							if ( msgType !== ( type === 'Group' ? 2 : 1 ) ) {
								return false;
							}
							if ( msgType === 2 && groupId && groupId !== result[2] ) {
								return false;
							}
						} else if ( msgType !== 0 ) {
							return false;
						}
					}
					return true;
				} );
			
			const pageRespData = respData.slice( ( page - 1 ) * length, page * length );
			
			res.status( 200 ).send( { code: 200, data: pageRespData, total: respData.length } );
			return;
		}
		res.status( 404 ).send( { code: 404, data: {}, msg: "NotFound" } );
	} catch ( error ) {
		next( error );
	}
} );