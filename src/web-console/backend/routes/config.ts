import express, { Response } from "express";
import { mergeWith } from "lodash";
import bot from "ROOT";

export default express.Router()
	.get( "/", ( req, res ) => {
		const fileName = <string>req.query.fileName;
		if ( !fileName ) {
			res.status( 400 ).send( { code: 400, data: {}, msg: "Error Params" } );
			return;
		}
		const data = getFileData( res, fileName );
		if ( fileName === "setting" ) {
			delete data.password;
			delete data.dbPassword;
			delete data.webConsole.jwtSecret
		}
		res.status( 200 ).send( { code: 200, data, msg: "Success" } );
	} )
	.post( "/set", ( req, res ) => {
		const fileName = <string>req.body.fileName;
		const content = req.body.data;
		if ( !fileName || !content ) {
			res.status( 400 ).send( { code: 400, data: {}, msg: "Error Params" } );
			return;
		}
		const data = getFileData( res, fileName );
		mergeWith( data, content, ( objValue, srcValue ) => {
			if ( objValue instanceof Array ) {
				return srcValue;
			}
		} );
		bot.file.writeYAML( fileName, data );
		res.status( 200 ).send( { code: 200, data: {}, msg: "Success" } );
	} )

function getFileData( res: Response, fileName: string ): any {
	const path = bot.file.getFilePath( `${ fileName }.yml` );
	const exist = bot.file.isExist( path );
	if ( !exist ) {
		res.status( 404 ).send( { code: 404, data: {}, msg: "Not Found" } );
		return;
	}
	return bot.file.loadYAML( fileName );
}