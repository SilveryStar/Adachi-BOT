import { defineDirective } from "@/modules/command";
import { EpitomizedPath } from "#/genshin/module/wish";
import { wishClass } from "#/genshin/init";

export default defineDirective( "order", async ( { messageData, sendMessage, matchResult, redis } ) => {
	const param = Number.parseInt( matchResult.match[0] );
	const userID: number = messageData.user_id;
	
	const dbKey: string = `silvery-star.epitomized-path-${ userID }`;
	const weaponDBKey: string = `silvery-star.wish-weapon-${ userID }`;
	
	const nowWeaponID: string = wishClass.getWeaponID();
	const upWeapon: string[] | undefined = wishClass.getUpWeapon();
	if ( upWeapon === undefined ) {
		await sendMessage( "当前没有正在开启的武器池" );
		return;
	}
	
	if ( Number.isNaN( param ) ) {
		const user: number = await EpitomizedPath.getUser( dbKey );
		
		const data = await redis.getHash( weaponDBKey );
		let epit: number = Number.parseInt( data.epit );
		if ( Number.isNaN( epit ) ) {
			await redis.setHash( weaponDBKey, { epit: 0 } );
			epit = 0;
		}
		
		const msg: string[] = [ "无定轨", ...upWeapon ]
			.map( ( el, i ) => {
				return `\n ${ i === user ? "*" : "-" } ${ el }` +
					`${ i === user && i > 0 ? ` (${ epit }/2)` : "" }`
			} );
		await sendMessage( "当前定轨:" + msg.join( "" ) );
	} else if ( param === 0 ) {
		/*清除定轨*/
		await redis.setHash( weaponDBKey, { epit: 0 } );
		await redis.deleteKey( dbKey );
		await sendMessage( `武器定轨记录已清除` );
	} else {
		/* 切换定轨武器，清空命定值 */
		await redis.setHash( weaponDBKey, { epit: 0 } );
		await redis.setHash( dbKey, { id: nowWeaponID, set: param } );
		await sendMessage( `武器已定轨至: ${ upWeapon[param - 1] }` );
	}
} );