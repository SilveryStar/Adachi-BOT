import express from "express";
import { typeData } from "../init";

export default express.Router().get( "/", async ( req, res ) => {
	const type: string = <string>req.query.type;
	const data: any = type === "character" ? typeData.character : typeData.weapon;
	res.send( data );
} );