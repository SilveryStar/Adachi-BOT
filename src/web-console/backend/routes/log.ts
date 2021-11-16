import express from "express";
import bot from "ROOT";

export default express.Router().get( "/", ( req, res ) => {
	const fileName: string = `logs/bot.${ req.query.date }.log`;
	const path: string = bot.file.getFilePath( fileName, "root" );

	if ( bot.file.isExist( path ) ) {
		const file = bot.file.readFile( fileName, "root" );
		const respData = file.replace( /(\n|\r|\r\n)/g, "__ADACHI__" )
		res.status( 200 ).send( respData );
		return;
	}
	res.status( 404 ).send( { code: 404, data: {}, msg: "NotFound" } );
} );