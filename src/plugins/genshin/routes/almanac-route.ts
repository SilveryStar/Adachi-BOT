import express from "express";
import bot from "ROOT";

export default express.Router().get( "/", async ( req, res ) => {
	const data: string = await bot.redis.getString( "silvery-star.almanac" );
	res.send( JSON.parse( data ) );
} );