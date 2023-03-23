import express from "express";
import { mergeWith } from "lodash";
import bot from "ROOT";

interface FileData {
	code: number;
	data: any;
}

export default express.Router()
	.get( "/", ( req, res ) => {
		const fileName = <string>req.query.fileName;
		if ( !fileName ) {
			res.status( 400 ).send( { code: 400, data: {}, msg: "Error Params" } );
			return;
		}
		const fileData: FileData = getFileData( fileName );
		if ( fileData.code !== 200 ) {
			res.status( fileData.code ).send( { code: fileData.code, data: {}, msg: fileData.data } );
			return;
		}
		
		const data = fileData.data;
		
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
		
		let data: any;
		if ( force ) {
			data = content;
		} else {
			const fileData: FileData = getFileData( fileName );
			if ( fileData.code !== 200 ) {
				res.status( fileData.code ).send( { code: fileData.code, data: {}, msg: fileData.data } );
				return;
			}
			data = fileData.data;
			
			mergeWith( data, content, ( objValue, srcValue ) => {
				if ( objValue instanceof Array ) {
					return srcValue;
				}
			} );
		}
		bot.file.writeYAML( fileName, data );
		res.status( 200 ).send( { code: 200, data: {}, msg: "Success" } );
	} )
	.post( "/set/code", ( req, res ) => {
		const data = req.body.data;
		if ( typeof data !== "string" ) {
			res.status( 400 ).send( { code: 400, data: {}, msg: "Error Params" } );
			return;
		}
		
		const dirName = `src/data/${ bot.config.number }`;
		const codePath = `${ dirName }/code.txt`;
		bot.file.createDir( dirName, "root", true );
		const exist = bot.file.createFile( codePath, data, "root" );
		if ( exist ) {
			bot.file.writeFile( codePath, data, "root" );
		}
		res.status( 200 ).send( { code: 200, data: {}, msg: "Success" } );
	} )
	.post( "/set/ticket", ( req, res ) => {
		const data = req.body.data;
		if ( typeof data !== "string" ) {
			res.status( 400 ).send( { code: 400, data: {}, msg: "Error Params" } );
			return;
		}
		
		const dirName = `src/data/${ bot.config.number }`;
		const ticketPath = `${ dirName }/ticket.txt`;
		bot.file.createDir( dirName, "root", true );
		const exist = bot.file.createFile( ticketPath, data, "root" );
		if ( exist ) {
			bot.file.writeFile( ticketPath, data, "root" );
		}
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
			
			const fileData: FileData = getFileData( fileName );
			if ( fileData.code !== 200 ) {
				return null;
			}
			return { name: fileName, data: fileData.data };
		} ).filter( c => !!c );
		
		res.status( 200 ).send( { code: 200, data, msg: "Success" } );
	} )

function getFileData( fileName: string ): FileData {
	const path = bot.file.getFilePath( `${ fileName }.yml` );
	const exist = bot.file.isExist( path );
	if ( !exist ) {
		return { code: 404, data: "Not Found" };
	}
	try {
		return { code: 200, data: bot.file.loadYAML( fileName ) };
	} catch ( error ) {
		return { code: 500, data: error.message || "Server Error" };
	}
}