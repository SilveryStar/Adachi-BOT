import express from "express";
import { mergeWith } from "lodash";
import bot from "ROOT";
import Plugin from "@/modules/plugin";
import { PluginConfig } from "@/web-console/backend/types/config";
import { BotConfigValue } from "@/modules/config";

interface FileData {
	code: number;
	data: any;
}

export default express.Router()
	.get( "/", async ( req, res ) => {
		const fileName = <string>req.query.fileName;
		if ( !fileName ) {
			res.status( 400 ).send( { code: 400, data: {}, msg: "Error Params" } );
			return;
		}
		const fileData: FileData = await getFileData( fileName );
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
	.get( "/base", async ( req, res ) => {
		const getBaseData = async ( fileName: string ) => {
			const data: FileData = await getFileData( fileName );
			if ( data.code !== 200 ) {
				throw data;
			}
			return data.data;
		}
		
		try {
			const config: BotConfigValue = {
				base: await getBaseData( "base" ),
				directive: await getBaseData( "directive" ),
				db: await getBaseData( "db" ),
				mail: await getBaseData( "mail" ),
				autoChat: await getBaseData( "autoChat" ),
				whiteList: await getBaseData( "whiteList" ),
				banScreenSwipe: await getBaseData( "banScreenSwipe" ),
				banHeavyAt: await getBaseData( "banHeavyAt" ),
				webConsole: await getBaseData( "webConsole" ),
			}
			
			res.status( 200 ).send( { code: 200, data: config, msg: "Success" } );
		} catch ( error ) {
			const err = <FileData>error;
			res.status( err.code ).send( { code: err.code, msg: err.data } );
		}
	} )
	.post( "/set", async ( req, res ) => {
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
			const fileData: FileData = await getFileData( fileName );
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
		await bot.file.writeYAML( fileName, data );
		res.status( 200 ).send( { code: 200, data: {}, msg: "Success" } );
	} )
	.post( "/set/code", async ( req, res ) => {
		const data = req.body.data;
		if ( typeof data !== "string" ) {
			res.status( 400 ).send( { code: 400, data: {}, msg: "Error Params" } );
			return;
		}
		
		const codePath = `src/data/${ bot.client.uin }/code.txt`;
		await bot.file.writeFile( codePath, data, "root" );
		res.status( 200 ).send( { code: 200, data: {}, msg: "Success" } );
	} )
	.post( "/set/ticket", async ( req, res ) => {
		const data = req.body.data;
		if ( typeof data !== "string" ) {
			res.status( 400 ).send( { code: 400, data: {}, msg: "Error Params" } );
			return;
		}
		
		const ticketPath = `src/data/${ bot.client.uin }/ticket.txt`;
		await bot.file.writeFile( ticketPath, data, "root" );
		res.status( 200 ).send( { code: 200, data: {}, msg: "Success" } );
	} )
	.get( "/plugins", async ( req, res, next ) => {
		try {
			const data: PluginConfig[] = [];
			const pluginList = Plugin.getInstance().pluginList;
			for ( const plugin in pluginList ) {
				const configFiles = await bot.file.getDirFiles( plugin );
				if ( !configFiles.length ) continue;
				
				const configs: PluginConfig["configs"] = [];
				
				for ( const name of configFiles ) {
					const fileName = name.replace( ".yml", "" );
					const fileData: FileData = await getFileData( `${ plugin }/${ fileName }` );
					if ( fileData.code !== 200 ) {
						continue;
					}
					configs.push( {
						name: fileName,
						data: JSON.stringify( fileData.data, null, 4 )
					} );
				}
				
				const name = pluginList[plugin].name;
				
				data.push( { name, plugin, configs } );
			}
			
			res.status( 200 ).send( { code: 200, data, msg: "Success" } );
		} catch ( error ) {
			next( error );
		}
	} )

async function getFileData( fileName: string ): Promise<FileData> {
	const path = bot.file.getFilePath( `${ fileName }.yml` );
	const exist = await bot.file.isExist( path );
	if ( !exist ) {
		return { code: 404, data: "Not Found" };
	}
	try {
		return { code: 200, data: await bot.file.loadYAML( fileName ) || {} };
	} catch ( error: any ) {
		return { code: 500, data: error.message || "Server Error" };
	}
}