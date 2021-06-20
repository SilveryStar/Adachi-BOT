import express from "express";
import { getInfo } from "../utils/api";

const router = express.Router();

router.get( "/", async ( req, res ) => {
	const name: string = <string>req.query.name;
	const data: any = await getInfo( name );
	res.send( data );
} );

export default router;