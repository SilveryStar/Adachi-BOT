import { defineDirective } from "@/modules/command";

export default defineDirective( "order", async ( { sendMessage, messageData, matchResult, redis } ) => {
	const choice = matchResult.match[0];
	const userID = messageData.user_id;
	
	const data: string | null = await redis.getString( `silvery-star.wish-choice-${ userID }` );
	if ( data === null ) {
		await redis.setString( `silvery-star.wish-choice-${ userID }`, choice );
		await redis.setHash( `silvery-star.wish-indefinite-${ userID }`, { five: 1, four: 1 } );
		await redis.setHash( `silvery-star.wish-character-${ userID }`, { five: 1, four: 1, isUp: 0 } );
		await redis.setHash( `silvery-star.wish-weapon-${ userID }`, { five: 1, four: 1 } );
	}
	
	await redis.setString( `silvery-star.wish-choice-${ userID }`, choice );
	await sendMessage( "卡池切换成功" );
} );