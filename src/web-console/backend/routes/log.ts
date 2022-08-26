import express from "express";
import bot from "ROOT";

export default express.Router().get( "/", ( req, res ) => {
	const page = parseInt( <string>req.query.page ); // 当前第几页
	const length = parseInt( <string>req.query.length ); // 页长度
	const logLevel = <string>req.query.logLevel; // 日志等级
	const msgType = parseInt( <string>req.query.msgType ); // 消息类型 0：系统 1: 私聊 2: 群聊
	const groupId = <string>req.query.groupId; // 群号，仅 msgType 为 2 时可用
	const utcDiffer = 8 * 60 * 60 * 1000;
	const date = new Date( parseInt( <string>req.query.date ) + utcDiffer ).toJSON();  // 日期时间戳
	
	if ( !page || !length || !date ) {
		res.status( 400 ).send( { code: 400, data: {}, msg: "Error Params" } );
		return;
	}
	
	const fileName: string = `logs/bot.${ date.split( "T" )[0] }.log`;
	const path: string = bot.file.getFilePath( fileName, "root" );
	
	try {
		if ( bot.file.isExist( path ) ) {
			const file = bot.file.readFile( fileName, "root" );
			const fullData = file.split( /[\n\r]/g ).filter( el => el.length !== 0 );
			const respData = fullData
				.slice( ( page - 1 ) * length, page * length )
				.map( el => JSON.parse( el ) )
				.filter( el => {
					/* 过滤日志等级 */
					if ( logLevel && el.level !== logLevel.toUpperCase() ) {
						return false;
					}
					/* 过滤消息类型 */
					if ( !Number.isNaN(msgType) ) {
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
						} else if (msgType !== 0) {
							return false;
						}
					}
					return true;
				} );
			
			res.status( 200 ).send( { code: 200, data: respData, total: fullData.length } );
			return;
		}
		res.status( 404 ).send( { code: 404, data: {}, msg: "NotFound" } );
	} catch ( e ) {
		res.status( 500 ).send( { code: 500, data: {}, msg: "Server Error" } );
	}
} );