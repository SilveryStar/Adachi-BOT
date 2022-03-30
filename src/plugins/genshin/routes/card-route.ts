import express from "express";
import bot from "ROOT";

async function loadMysData( userID: number ): Promise<any> {
	const uid: string = await bot.redis.getString( `silvery-star.user-querying-id-${ userID }` );
	const data: any = await bot.redis.getHash( `silvery-star.card-data-${ uid }` );
	data.homes = JSON.parse( data.homes );
	data.stats = JSON.parse( data.stats );
	data.explorations = JSON.parse( data.explorations );
	data.avatars = JSON.parse( data.avatars );
	data.allHomes = data.allHomes ? JSON.parse( data.allHomes ) : [];
	
	return data;
}

export default express.Router().get( "/", async ( req, res ) => {
	const userID: number = parseInt( <string>req.query.qq );
	const data: any = await loadMysData( userID );
	res.send( data );
} );