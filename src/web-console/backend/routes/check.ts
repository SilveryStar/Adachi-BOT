import express from "express";
import bot from "ROOT";
import { getTokenByRequest } from "../utils/request";
import { validateToken } from "../utils/jwt";
import account from "../utils/account";

export default express.Router()
	.get( "/", ( req, res, next ) => {
		try {
			const token: string = getTokenByRequest( req ) || "";
			const valid = validateToken( bot.config.webConsole.jwtSecret, token );
			res.status( 200 ).send( { code: 200, data: valid, msg: "Success" } );
		} catch ( error ) {
			next( error );
		}
	} )
	.get( "/root", async ( req, res, next ) => {
		try {
			const hasRoot = account.hasRoot();
			res.status( 200 ).send( { code: 200, data: hasRoot, msg: "Success" } );
		} catch ( error ) {
			next( error );
		}
	} )