import compressing from "compressing";
import FormData from "form-data";
import axios from "axios";
import fs from "fs";
import { parse } from "yaml";

const packageInfo = JSON.parse( fs.readFileSync( "./package.json", "utf8" ) );
const version = packageInfo.version;

( async () => {
	const zipPath = "./dist.zip";
	await compressing.zip.compressDir( "./dist", zipPath );
	console.log( "打包完成，开始上传打包资源" );
	const formData = new FormData();
	formData.append( "version", version );
	formData.append( "dist", fs.createReadStream( zipPath ) );
	
	const buildSetting = await new Promise( resolve => {
		fs.readFile( "./build_setting.yml", "utf-8", ( error, data ) => {
			if ( error ) {
				return resolve( {} );
			}
			resolve( parse( data ) || {} );
		} );
	} );
	
	try {
		await axios.post( "https://api-kozakura.marrydream.top/common/adachi/v1/oss/web-console/upload", formData, {
			headers: {
				...formData.getHeaders(),
				Authorization: buildSetting.upload_token
			}
		} );
	} catch ( error ) {
		console.log( `打包资源上传失败: ${ error.message }` )
		await fs.unlinkSync( zipPath );
		return;
	}
	await fs.unlinkSync( zipPath );
	console.log( "打包资源上传完成" );
} )();