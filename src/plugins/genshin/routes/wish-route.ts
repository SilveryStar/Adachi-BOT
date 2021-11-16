import express from "express";
import bot from "ROOT";
import { WishResult } from "../module/wish";

export default express.Router().get( "/", async ( req, res ) => {
	const qqID: number = parseInt( <string>req.query.qq );
	const data: WishResult = JSON.parse( <string>await bot.redis.getString( `silvery-star.wish-result-${ qqID }` ) );
	res.send( data );
} );