import { InputParameter } from "@modules/command";
import { WishResult } from "../module/wish";
import { wishClass } from "../init";
import { render } from "../utils/render";

export async function main(
	{ sendMessage, messageData, redis }: InputParameter
): Promise<void> {
	const userID: number = messageData.user_id;
	const nickname: string = messageData.sender.nickname;
	
	let choice: string | null = await redis.getString( `silvery-star.wish-choice-${ userID }` );
	if ( choice === null ) {
		choice = "角色"
		await redis.setString( `silvery-star.wish-choice-${ userID }`, "角色" );
		await redis.setHash( `silvery-star.wish-indefinite-${ userID }`, { five: 1, four: 1 } );
		await redis.setHash( `silvery-star.wish-character-${ userID }`, { five: 1, four: 1, isUp: 0 } );
		await redis.setHash( `silvery-star.wish-weapon-${ userID }`, { five: 1, four: 1 } );
	}
	
	const result: WishResult[] | null = await wishClass.get( userID, choice );
	if ( result === null ) {
		await sendMessage( `${ choice }卡池暂未开放，请在游戏内卡池开放后再尝试` );
		return;
	}

	await redis.setString( `silvery-star.wish-result-${ userID }`, JSON.stringify( {
		type: choice,
		data: result,
		name: nickname
	} ) );
	const image: string = await render( "wish", { qq: userID } );
	await sendMessage( image );
}