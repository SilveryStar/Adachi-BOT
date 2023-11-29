import express from "express";
import bot from "ROOT";
import { Md5 } from "md5-typescript";
import account from "../utils/account";

export default express.Router()
	.post( "/root/create", async ( req, res, next ) => {
		try {
			const username = req.body.username;
			const password = req.body.password;
			const secret = req.body.secret;
			
			const registrationKey = await bot.file.loadFile( "data/registration_key.txt", "root" );
			
			if ( secret !== Md5.init( registrationKey ) ) {
				res.status( 412 ).send( { code: 412, data: {}, msg: "密钥错误" } );
				return;
			}
			
			/* 是否已经存在 root 用户 */
			const errorMsg = await account.createRoot( username, password );
			if ( errorMsg ) {
				res.status( 405 ).send( { code: 405, data: {}, msg: errorMsg } );
				return;
			}
			
			res.status( 200 ).send( { code: 200, data: {}, msg: "Success" } );
		} catch ( error: any ) {
			next( error );
		}
	} );