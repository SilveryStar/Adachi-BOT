import { PrivateMessageEventData, GroupMessageEventData } from "oicq";
import { wishClass } from "../init";
import { Redis } from "../../../bot";
import { WishResult } from "../module/wish";
import { render } from "../utils/render";

type Message = PrivateMessageEventData | GroupMessageEventData;

async function main( sendMessage: ( content: string ) => any, message: Message ): Promise<void> {
	const qqID: number = message.user_id;
	const nickname: string = message.sender.nickname;
	
	let choice: string | null = await Redis.getString( `silvery-star.wish-choice-${ qqID }` );
	if ( choice === null ) {
		choice = "角色"
		await Redis.setString( `silvery-star.wish-choice-${ qqID }`, "角色" );
		await Redis.setHash( `silvery-star.wish-indefinite-${ qqID }`, { five: 1, four: 1 } );
		await Redis.setHash( `silvery-star.wish-character-${ qqID }`, { five: 1, four: 1, isUp: 0 } );
		await Redis.setHash( `silvery-star.wish-weapon-${ qqID }`, { five: 1, four: 1 } );
	}
	
	const result: WishResult[] = await wishClass.get( qqID, choice );
	
	await Redis.setString( `silvery-star.wish-result-${ qqID }`, JSON.stringify( {
		type: choice,
		data: result,
		name: nickname
	} ) );
	const image: string = await render( "wish", { qq: qqID } );
	await sendMessage( image );
}

export { main }