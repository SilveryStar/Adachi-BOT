import express from "express";
import bot from "ROOT"

async function charData( userID: number, name: string ): Promise<any> {
	const dbKey: string = `silvery-star.card-data-${ userID }`
	const data: any = await bot.redis.getHash( dbKey );
	
	const uid: string = data.uid;
	const char = JSON.parse( data.avatars ).find( el => el.name === name );
	return { uid, ...char };
}

export default express.Router().get( "/", async ( req, res ) => {
	const userID: number = parseInt( <string>req.query.qq );
	const name: string = <string>req.query.name;
	const data: any = await charData( userID, name );
	res.send( data );
} );