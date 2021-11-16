import express from "express";

export default express.Router().get( "/", ( req, res ) => {
	res.status( 200 ).send( "Success" );
} );