import express from "express";
import { loadMysData } from "../utils/load";

const router = express.Router();

router.get( "/", async ( req, res ) => {
	const qqID: number = parseInt( <string>req.query.qq );
	const data: any = await loadMysData( qqID );
	res.send( data );
} );

export default router;