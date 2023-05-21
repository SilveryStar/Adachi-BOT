import express from "express";
import { getInfo } from "#/genshin/utils/meta";

export default express.Router().get( "/", async ( req, res ) => {
	const name: string = <string>req.query.name;
	const data = await getInfo( name );
	if ( !data ) {
		return res.status( 404 ).send( "Not Found" );
	}
	res.status( 200 ).send( data );
} );