import express from "express";
import { mergeWith } from "lodash";
import bot from "ROOT";

export default express.Router()
	.get( "/", ( req, res ) => {
		const fileName = <string>req.query.fileName;
		if ( !fileName ) {
			res.status( 400 ).send( { code: 400, data: {}, msg: "Error Params" } );
			return;
		}
		const data = getFileData( fileName );
		if ( data === 404 ) {
			res.status( 404 ).send( { code: 404, data: {}, msg: "Not Found" } );
			return;
		}
		if ( data === 500 ) {
			res.status( 500 ).send( { code: 500, data: {}, msg: "Server Error" } );
			return;
		}
		
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
		const force = !!req.body.force;
		if ( !fileName || !content ) {
			res.status( 400 ).send( { code: 400, data: {}, msg: "Error Params" } );
			return;
		}
		
		let data;
		if ( force ) {
			data = content;
		} else {
			data = getFileData( fileName );
			if ( data === 404 ) {
				res.status( 404 ).send( { code: 404, data: {}, msg: "Not Found" } );
				return;
			}
			if ( data === 500 ) {
				res.status( 500 ).send( { code: 500, data: {}, msg: "Server Error" } );
				return;
			}
			
			mergeWith( data, content, ( objValue, srcValue ) => {
				if ( objValue instanceof Array ) {
					return srcValue;
				}
			} );
		}
		bot.file.writeYAML( fileName, data );
		res.status( 200 ).send( { code: 200, data: {}, msg: "Success" } );
	} )
	.get( "/plugins", ( req, res ) => {
		const configFiles = bot.file.getDirFiles( "" );
		const data = configFiles.map( name => {
			const fileName = name.replace( ".yml", "" );
			/* 过滤非插件配置项 */
			if ( [ "setting", "commands", "cookies", "whitelist" ].includes( fileName ) ) {
				return null;
			}
			
			const data = getFileData( fileName );
			if ( typeof data === "number" ) {
				return null;
			}
			return { name: fileName, data };
		} ).filter( c => !!c );
		
		res.status( 200 ).send( { code: 200, data, msg: "Success" } );
	} )

function getFileData( fileName: string ): any {
	const path = bot.file.getFilePath( `${ fileName }.yml` );
	const exist = bot.file.isExist( path );
	if ( !exist ) {
		return 404;
	}
	try {
		return bot.file.loadYAML( fileName );
	} catch ( error ) {
		return 500;
	}
}