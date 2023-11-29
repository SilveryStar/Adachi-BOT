import express from "express";
import bot from "ROOT";
import { getToken } from "@/web-console/backend/utils/jwt";
import account from "../utils/account";
import { RequestParamsError } from "@/web-console/backend/utils/error";

export default express.Router()
	.post( "/", async ( req, res, next ) => {
		const username = req.body.username;
		const password = req.body.password;
		
		try {
			const info = await account.getAccount( username );
			if ( !info ) {
				return next( new RequestParamsError() );
			}
			if ( info.password === password ) {
				res.status( 200 ).send( {
					code: 200,
					data: getToken( bot.config.webConsole.jwtSecret, username )
				} );
			} else {
				res.status( 412 ).send( { code: 412, data: {}, msg: "用户名或密码错误" } );
			}
		} catch ( error ) {
			next( error );
		}
	} );