import express from "express";
import bot from "ROOT";

export default express.Router().get( "/", async ( req, res ) => {
	const userID: number = parseInt( <string>req.query.qq );
	const type: string = <string>req.query.type;
	const data: any = JSON.parse( <string>await bot.redis.getString( `silvery-star.artifact-${ userID }` ) );
	res.send( type === "init" ? data.initProp : data.reinProp );
} );