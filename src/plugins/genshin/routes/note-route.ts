import express from "express";
import bot from "ROOT";

export default express.Router().get( "/", async ( req, res ) => {
	const uid = <string>req.query.uid;
	const dbKey: string = `silvery-star.note-temp-${ uid }`;
	const data: string = await bot.redis.getString( dbKey );
	res.send( JSON.parse( data ) );
} );