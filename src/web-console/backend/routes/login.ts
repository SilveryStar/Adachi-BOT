import express from "express";
import bot from "ROOT";
import { getToken } from "@/web-console/backend/utils/jwt";
import account from "../utils/account";

export default express.Router()
	.post( "/", async ( req, res ) => {
		const username = req.body.username;
		const password = req.body.password;
		
		try {
			const info = await account.getAccount( username );
			if ( !info ) {
				res.status( 404 ).send( { code: 404, data: {}, msg: "当前用户不存在" } );
				return;
			}
			if ( info.password === password ) {
				res.status( 200 ).send( {
					code: 200,
					data: getToken( bot.config.webConsole.jwtSecret, username )
				} );
			} else {
				res.status( 412 ).send( { code: 412, data: {}, msg: "用户名或密码错误" } );
			}
		} catch ( error: any ) {
			res.status( 500 ).send( { code: 500, data: {}, msg: error.message || "Server Error" } );
		}
	} );