import { deepParse } from "#genshin/utils/deep-parse";
import bot from "ROOT";
import express from "express";
import { typeData } from "#genshin/init";

export default express.Router()
	.get( "/result", async ( req, res ) => {
		const userID: number = parseInt( <string>req.query.qq );
		const data = JSON.parse( <string>await bot.redis.getString( `silvery-star.wish-result-${ userID }` ) );
		res.send( data );
	} )
	.get( "/statistic", async ( req, res ) => {
		const userID: number = parseInt( <string>req.query.qq );
		const data = await bot.redis.getHash( `silvery-star.wish-statistic-${ userID }` );
		res.send( deepParse( data ) );
	} )
	.get( "/config", async ( req, res ) => {
		const type: string = <string>req.query.type;
		const data: any = type === "character" ? typeData.character : typeData.weapon;
		res.send( data );
	} );