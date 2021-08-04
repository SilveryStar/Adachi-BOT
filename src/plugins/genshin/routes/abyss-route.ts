import express from "express";
import { Redis } from "../../../bot";

const router = express.Router();

router.get( "/", async ( req, res ) => {
	const data: any = await Redis.getHash( `kernel-bin.abyss-data-${ req.query.uid }` );
	res.send( JSON.stringify( data ) );
} );

export default router;
