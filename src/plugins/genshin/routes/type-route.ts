import express from "express";
import { getWishConfig } from "../utils/api";

const router = express.Router();

router.get( "/", async ( req, res ) => {
	const type: string = <string>req.query.type;
	const data: any = await getWishConfig( type );
	res.send( data );
} );

export default router;