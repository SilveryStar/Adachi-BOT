import express from "express";
import { getInfo } from "../utils/api";

export default express.Router().get( "/", async ( req, res ) => {
	const name: string = <string>req.query.name;
	const data: any = await getInfo( name );
	res.send( data );
} );