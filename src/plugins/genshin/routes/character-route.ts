import express from "express";
import bot from "ROOT"

async function charData( userID: number, name: string ): Promise<any> {
	const uid: string = await bot.redis.getString( `silvery-star.user-querying-id-${ userID }` );
	const dbKey: string = `silvery-star.card-data-${ uid }`
	const data: any = await bot.redis.getHash( dbKey );
	
	const char = JSON.parse( data.avatars ).find( el => el.name === name );
	return { uid, ...char };
}

export default express.Router().get( "/", async ( req, res ) => {
	const userID: number = parseInt( <string>req.query.qq );
	const name: string = <string>req.query.name;
	const data: any = await charData( userID, name );
	res.send( data );
} );