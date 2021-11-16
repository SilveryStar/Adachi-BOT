import { InputParameter } from "@modules/command";

export async function main( { sendMessage, messageData, redis }: InputParameter ): Promise<void> {
	const choice: string = messageData.raw_message;
	const qqID: number = messageData.user_id;
	
	const data: string | null = await redis.getString( `silvery-star.wish-choice-${ qqID }` );
	if ( data === null ) {
		await redis.setString( `silvery-star.wish-choice-${ qqID }`, choice );
		await redis.setHash( `silvery-star.wish-indefinite-${ qqID }`, { five: 1, four: 1 } );
		await redis.setHash( `silvery-star.wish-character-${ qqID }`, { five: 1, four: 1, isUp: 0 } );
		await redis.setHash( `silvery-star.wish-weapon-${ qqID }`, { five: 1, four: 1 } );
	}
	
	await redis.setString( `silvery-star.wish-choice-${ qqID }`, choice );
	await sendMessage( "卡池切换成功" );
}