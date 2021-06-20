import express from "express";
import { Redis } from "../../../bot";

const router = express.Router();

router.get( "/", async ( req, res ) => {
	const qqID: number = parseInt( <string>req.query.qq );
	const type: string = <string>req.query.type;
	const data: any = JSON.parse( await Redis.getString( `silvery-star.artifact-${ qqID }` ) as string );
	res.send( type === "init" ? data.initProp : data.reinProp );
} );

export default router;