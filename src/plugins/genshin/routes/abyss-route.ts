import { deepParse } from "#/genshin/utils/deep-parse";
import express from "express";
import bot from "ROOT";

export default express.Router()
	.get( "/", async ( req, res ) => {
		const userID: number = parseInt( <string>req.query.qq );
		const floor = <string>req.query.floor;
		const dbKey: string = `silvery-star.abyss-temp-${ userID }-${ floor }`;
		const data = await bot.redis.getHash( dbKey );
		res.send( deepParse( data ) );
	} )
	.get( "/single", async ( req, res )  => {
		const userID: number = parseInt( <string>req.query.qq );
		const dbKey: string = `silvery-star.abyss-temp-${ userID }-single`;
		const data = await bot.redis.getHash( dbKey );
		res.send( deepParse( data ) );
	} )