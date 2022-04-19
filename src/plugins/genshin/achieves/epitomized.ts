import { InputParameter } from "@modules/command";
import { EpitomizedPath } from "#genshin/module/wish";
import { wishClass } from "#genshin/init";
import bot from "ROOT";

export async function main(
	{ messageData, sendMessage, redis }: InputParameter
): Promise<void> {
	const param: string = messageData.raw_message;
	const userID: number = messageData.user_id;
	
	const dbKey: string = `silvery-star.epitomized-path-${ userID }`;
	const weaponDBKey: string = `silvery-star.wish-weapon-${ userID }`;
	
	const nowWeaponID: string = wishClass.getWeaponID();
	const upWeapon: string[] | undefined = wishClass.getUpWeapon();
	if ( upWeapon === undefined ) {
		await sendMessage( "当前没有正在开启的武器池" );
		return;
	}
	
	if ( param.length === 0 ) {
		const user: number = await EpitomizedPath.getUser( dbKey );
		
		let { epit } = await redis.getHash( weaponDBKey );
		if ( epit === undefined ) {
			await bot.redis.setHash( weaponDBKey, { epit: 0 } );
			epit = 0;
		}
		
		const msg: string[] = [ "无定轨", ...upWeapon ]
			.map( ( el, i ) => {
				return `\n ${ i === user ? "*" : "-" } ${ el }` +
					      `${ i === user && i > 0 ? ` (${ epit }/2)` : "" }`
			} );
		await sendMessage( "当前定轨:" + msg.join( "" ) );
	} else if ( parseInt( param ) === 0 ) {
		/*清除定轨*/
		await redis.setHash( weaponDBKey, { epit: 0 } );
		await redis.deleteKey( dbKey );
		await sendMessage( `武器定轨记录已清除` );
	} else {
		/* 切换定轨武器，清空命定值 */
		await redis.setHash( weaponDBKey, { epit: 0 } );
		await redis.setHash( dbKey, { id: nowWeaponID, set: param } );
		await sendMessage( `武器已定轨至: ${ upWeapon[ parseInt( param ) - 1 ] }` );
	}
}