import express from "express";
import bot from "ROOT";

export default express.Router().get( "/", ( req, res ) => {
	const page = parseInt( <string>req.query.page ); // 当前第几页
	const length = parseInt( <string>req.query.length ); // 页长度
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
				.map( el => JSON.parse( el ) );
			res.status( 200 ).send( { code: 200, data: respData, total: fullData.length } );
			return;
		}
		res.status( 404 ).send( { code: 404, data: {}, msg: "NotFound" } );
	} catch ( e ) {
		res.status( 500 ).send( { code: 500, data: {}, msg: "Server Error" } );
	}
} );