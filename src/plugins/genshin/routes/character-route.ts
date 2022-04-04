import { deepParse } from "#genshin/utils/deep-parse";
import express from "express";
import bot from "ROOT";

export default express.Router().get( "/", async ( req, res ) => {
	const userID: number = parseInt( <string>req.query.qq );
	const dbKey: string = `silvery-star.character-temp-${ userID }`;
	const data: string = await bot.redis.getString( dbKey );
	res.send( deepParse( data ) )
} );