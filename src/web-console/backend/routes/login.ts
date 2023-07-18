import express from "express";
import bot from "ROOT";
import { getToken } from "@/web-console/backend/utils/jwt";
import { getAccount } from "../utils/account";

export default express.Router()
	.post( "/", async ( req, res ) => {
		const nickname = req.body.nickname;
		const password = req.body.password;
		
		const account = await getAccount( nickname );
		if ( !account ) {
			res.status( 404 ).send( { code: 404, data: {}, msg: "当前用户不存在" } );
			return;
		}
		if ( account.password === password ) {
			res.status( 200 ).send( {
				code: 200,
				data: getToken( bot.config.webConsole.jwtSecret, req.body.nickname )
			} );
		} else {
			res.status( 401 ).send( { code: 401, data: {}, msg: "用户名或密码错误" } );
		}
	} );