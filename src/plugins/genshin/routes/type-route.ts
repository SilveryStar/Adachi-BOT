import express from "express";
import { typeData } from "../init";

const router = express.Router();

router.get( "/", async ( req, res ) => {
	const type: string = <string>req.query.type;
	const data: any = type === "character" ? typeData.character : typeData.weapon;
	res.send( data );
} );

export default router;