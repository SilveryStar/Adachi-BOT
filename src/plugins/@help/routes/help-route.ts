import express from "express";
import bot from "ROOT";

export default express.Router().get( "/", async ( req, res ) => {
	const data = await bot.redis.getString( "adachi.help-data" );
	res.send( JSON.parse( data ) );
} )