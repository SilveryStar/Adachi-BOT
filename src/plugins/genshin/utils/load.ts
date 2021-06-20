import { Redis } from "../../../bot";

async function loadMysData( qqID: number ): Promise<any> {
	let data: any = await Redis.getHash( `silvery-star.card-data-${ qqID }` );
	data.homes = JSON.parse( data.homes );
	data.stats = JSON.parse( data.stats );
	data.explorations = JSON.parse( data.explorations );
	data.avatars = JSON.parse( data.avatars );
	
	return data;
}

export { loadMysData }