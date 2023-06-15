import express from "express";
import { mergeWith } from "lodash";
import bot from "ROOT";
import Plugin from "@/modules/plugin";
import { PluginConfig } from "@/web-console/types/config";
import { BotConfigValue } from "@/modules/config";

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
		
		const data: any = fileData.data;
		
		if ( fileName === "base" || fileName === "db" ) {
			Reflect.deleteProperty( data, "password" );
		}
		if ( fileName === "webConsole" ) {
			Reflect.deleteProperty( data, "jwtSecret" );
		}
		if ( fileName === "mail" ) {
			Reflect.deleteProperty( data, "pass" );
		}
		res.status( 200 ).send( { code: 200, data, msg: "Success" } );
	} )
	.get( "/base", ( req, res ) => {
		const getBaseData = (fileName: string) => {
			const data: FileData = getFileData( fileName );
			if ( data.code !== 200 ) {
				res.status( data.code ).send( { code: data.code, data: {}, msg: data.data } );
				throw data;
			}
			return data.data;
		}
		
		try {
			const config: BotConfigValue = {
				base: getBaseData( "base" ),
				directive: getBaseData( "directive" ),
				ffmpeg: getBaseData( "ffmpeg" ),
				db: getBaseData( "db" ),
				mail: getBaseData( "mail" ),
				autoChat: getBaseData( "autoChat" ),
				whiteList: getBaseData( "whiteList" ),
				banScreenSwipe: getBaseData( "banScreenSwipe" ),
				banHeavyAt: getBaseData( "banHeavyAt" ),
				webConsole: getBaseData( "webConsole" ),
			}
			
			res.status( 200 ).send( { code: 200, data: config, msg: "Success" } );
		} catch ( error ) {
			const err = <FileData>error;
			res.status( err.code ).send( { code: err.code, msg: err.data } );
		}
	})
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
		
		const codePath = `src/data/${ bot.config.base.number }/code.txt`;
		bot.file.writeFile( codePath, data, "root" );
		res.status( 200 ).send( { code: 200, data: {}, msg: "Success" } );
	} )
	.post( "/set/ticket", ( req, res ) => {
		const data = req.body.data;
		if ( typeof data !== "string" ) {
			res.status( 400 ).send( { code: 400, data: {}, msg: "Error Params" } );
			return;
		}
		
		const ticketPath = `src/data/${ bot.config.base.number }/ticket.txt`;
		bot.file.writeFile( ticketPath, data, "root" );
		res.status( 200 ).send( { code: 200, data: {}, msg: "Success" } );
	} )
	.get( "/plugins", ( req, res ) => {
		try {
			const data: PluginConfig[] = [];
			const pluginList = Plugin.getInstance().pluginList;
			for ( const plugin in pluginList ) {
				const configFiles = bot.file.getDirFiles( plugin );
				if ( !configFiles.length ) continue;
				
				const configs: PluginConfig["configs"] = [];
				configFiles.forEach( name => {
					const fileName = name.replace( ".yml", "" );
					const fileData: FileData = getFileData( `${ plugin }/${ fileName }` );
					if ( fileData.code !== 200 ) {
						return;
					}
					configs.push( {
						name: fileName,
						data: JSON.stringify( fileData.data, null, 4 )
					} );
				} )
				
				const name = pluginList[plugin].name;
				
				data.push( { name, plugin, configs } );
			}
			
			res.status( 200 ).send( { code: 200, data, msg: "Success" } );
		} catch ( error: any ) {
			res.status( 500 ).send( { code: 500, data: {}, msg: error.message || "Server Error" } );
		}
	} )

function getFileData( fileName: string ): FileData {
	const path = bot.file.getFilePath( `${ fileName }.yml` );
	const exist = bot.file.isExist( path );
	if ( !exist ) {
		return { code: 404, data: "Not Found" };
	}
	try {
		return { code: 200, data: bot.file.loadYAML( fileName ) || {} };
	} catch ( error: any ) {
		return { code: 500, data: error.message || "Server Error" };
	}
}