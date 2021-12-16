import { deepParse } from "#genshin/utils/deep-parse";
import express from "express";
import bot from "ROOT";

export default express.Router().get( "/", async ( req, res ) => {
	const id = <string>req.query.id;
	const dbKey: string = `silvery-star.daily-temp-${ id }`;
	const data = await bot.redis.getHash( dbKey );
	res.send( deepParse( data ) );
} );