import express from "express";
import bot from "ROOT";
import { Md5 } from "md5-typescript";
import getToken from "@web-console/backend/jwt";

export default express.Router().get( "/", ( req, res ) => {
	const num = parseInt( <string>req.query.num );
	const pwd = req.query.pwd;
	
	if ( bot.config.number === num &&
	   ( bot.config.password === pwd || bot.config.password === Md5.init( pwd ) )
	) {
		res.status( 200 ).send( { token: getToken(
			bot.config.webConsole.jwtSecret, bot.config.number
		) } );
	} else {
		res.status( 401 ).send( { msg: "Number or password is incorrect" } );
	}
} );