import express from "express";
import { WishResult } from "../module/wish";
import { Redis } from "../../../bot";

const router = express.Router();

router.get( "/", async ( req, res ) => {
	const qqID: number = parseInt( <string>req.query.qq );
	const data: WishResult = JSON.parse( await Redis.getString( `silvery-star.wish-result-${ qqID }` ) as string );
	res.send( data );
} );

export default router;