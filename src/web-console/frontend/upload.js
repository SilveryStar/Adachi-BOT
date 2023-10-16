import compressing from "compressing";
import FormData from "form-data";
import axios from "axios";
import fs from "fs";

( async () => {
	const zipPath = "./dist.zip";
	await compressing.zip.compressDir( "./dist", zipPath );
	console.log( "打包完成，开始上传打包资源" );
	const formData = new FormData();
	formData.append( "dist", fs.createReadStream( zipPath ) );
	await axios.post( "https://api-kozakura.marrydream.top/common/adachi/v1/oss/web-console/upload", formData, {
		headers: formData.getHeaders()
	} );
	await fs.unlinkSync( zipPath );
	console.log( "打包资源上传完成" );
} )();