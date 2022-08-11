import express from "express";
import bot from "ROOT";
import { Md5 } from "md5-typescript";
import getToken from "@web-console/backend/jwt";

export default express.Router()
	.get( "/", ( req, res ) => {
		res.status( 200 ).send( "Success" );
	} )
	.post( "/password", ( req, res ) => {
		const pwd = req.body.pwd;
		
		if ( pwd === bot.config.password || pwd === Md5.init( bot.config.password ) ) {
			res.status( 200 ).send( { code: 200, data: {}, msg: "Success" } );
		} else {
			res.status( 403 ).send( { code: 403, data: {}, msg: "Password is incorrect" } );
		}
	} );