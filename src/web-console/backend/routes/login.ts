import express from "express";
import bot from "ROOT";
import { Md5 } from "md5-typescript";
import { getToken } from "@web-console/backend/jwt";

export default express.Router().post( "/", ( req, res ) => {
	const num = parseInt( <string>req.body.num );
	const pwd = req.body.pwd;
	
	if ( bot.config.number === num &&
	   ( pwd === bot.config.password || pwd === Md5.init( bot.config.password ) )
	) {
		res.status( 200 ).send( { token: getToken(
			bot.config.webConsole.jwtSecret, bot.config.number
		) } );
	} else {
		res.status( 401 ).send( { msg: "Number or password is incorrect" } );
	}
} );