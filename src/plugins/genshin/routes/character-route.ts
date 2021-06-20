import express from "express";
import { Redis } from "../../../bot";
const router = express.Router();

async function charData( qqID: number, name: string ): Promise<any> {
	const dbKey: string = `silvery-star.card-data-${ qqID }`
	const data: any = await Redis.getHash( dbKey );
	
	const uid: string = data.uid;
	const char = JSON.parse( data.avatars ).find( el => el.name === name );
	return { uid, ...char };
}

router.get( "/", async ( req, res ) => {
	const qqID: number = parseInt( <string>req.query.qq );
	const name: string = <string>req.query.name;
	const data: any = await charData( qqID, name );
	res.send( data );
} );

export default router;