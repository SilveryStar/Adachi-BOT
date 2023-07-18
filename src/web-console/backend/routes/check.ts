import express from "express";
import bot from "ROOT";
import { getTokenByRequest } from "../utils/request";
import { validateToken } from "../utils/jwt";
import { hasRootAccount } from "@/web-console/backend/utils/account";

export default express.Router()
	.get( "/", ( req, res ) => {
		const token: string = getTokenByRequest( req ) || "";
		const valid = validateToken( bot.config.webConsole.jwtSecret, token );
		if ( valid ) {
			res.status( 200 ).send( "Success" );
		} else {
			res.status( 403 ).send( "Token Expired" );
		}
	} )
	.get( "/root", async ( req, res ) => {
		try {
			const hasRoot = await hasRootAccount();
			res.status( 200 ).send( { code: 200, data: hasRoot, msg: "Success" } );
		} catch ( error: any ) {
			res.status( 500 ).send( { code: 500, data: [], msg: error.message || "Server Error" } );
		}
	} )