import { CommonMessageEventData as Message } from "oicq";
import { sendType } from "../../../modules/message";
import { Redis } from "../../../bot";

async function main( sendMessage: sendType, message: Message ): Promise<void> {
	const choice: string = message.raw_message;
	const qqID: number = message.user_id;
	
	const data: string | null = await Redis.getString( `silvery-star.wish-choice-${ qqID }` );
	if ( data === null ) {
		await Redis.setString( `silvery-star.wish-choice-${ qqID }`, choice );
		await Redis.setHash( `silvery-star.wish-indefinite-${ qqID }`, { five: 1, four: 1 } );
		await Redis.setHash( `silvery-star.wish-character-${ qqID }`, { five: 1, four: 1, isUp: 0 } );
		await Redis.setHash( `silvery-star.wish-weapon-${ qqID }`, { five: 1, four: 1 } );
	}
	
	await Redis.setString( `silvery-star.wish-choice-${ qqID }`, choice );
	await sendMessage( "卡池切换成功" );
}

export { main }