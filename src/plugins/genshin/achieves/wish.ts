import { PrivateMessageEventData, GroupMessageEventData } from "oicq";
import { sendType } from "../../../modules/message";
import { WishResult } from "../module/wish";
import { wishClass } from "../init";
import { Redis } from "../../../bot";
import { render } from "../utils/render";

type Message = PrivateMessageEventData | GroupMessageEventData;

async function main( sendMessage: sendType, message: Message ): Promise<void> {
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
	
	const result: WishResult[] | null = await wishClass.get( qqID, choice );
	if ( result === null ) {
		await sendMessage( `${ choice }卡池暂未开放，请在游戏内卡池开放后再尝试` );
		return;
	}

	await Redis.setString( `silvery-star.wish-result-${ qqID }`, JSON.stringify( {
		type: choice,
		data: result,
		name: nickname
	} ) );
	const image: string = await render( "wish", { qq: qqID } );
	await sendMessage( image );
}

export { main }