import { Adachi, Redis } from "../../../bot";
import { cookies } from "../init";
import { getBaseInfo, getCharactersInfo, getDetailInfo, getSpiralAbyssInfo } from "./api";
import { omit } from "lodash";

async function baseInfoPromise( qqID: number, mysID: number ): Promise<string | [ number, string ]> {
	const { retcode, message, data } = await getBaseInfo( mysID, cookies.get() );
	
	return new Promise( async ( resolve, reject ) => {
		if ( retcode !== 0 ) {
			reject( `米游社接口报错: ${ message }` );
			return;
		} else if ( !data.list || data.list.length === 0 ) {
			reject( "未查询到角色数据，请检查米哈游通行证（非UID）是否有误或是否设置角色信息公开" );
			return;
		}
		
		const genshinInfo: any = data.list.find( el => el.game_id === 2 );
		if ( !genshinInfo ) {
			reject( "未查询到角色数据，请检查米哈游通行证（非UID）是否有误或是否设置角色信息公开" );
			return;
		}
		
		const { game_role_id, nickname, region, level } = genshinInfo;
		const uid: number = parseInt( game_role_id );
		
		await Redis.setHash( `silvery-star.card-data-${ qqID }`, { nickname, uid, level } );
		resolve( [ uid, region ] );
	} );
}

async function detailInfoPromise( qqID: number, uid: number, server: string, flag: boolean ): Promise<string | number[]> {
	const detail: any = await Redis.getHash( `silvery-star.card-data-${ qqID }` );
	
	if ( flag && detail.stats !== undefined && uid === parseInt( detail.stats.uid ) ) {
		Adachi.logger.info( `用户 ${ uid } 在一小时内进行过查询操作，将返回上次数据` );
		return Promise.reject( "gotten" );
	}
	
	const { retcode, message, data } = await getDetailInfo( uid, server, cookies.get() );
	cookies.increaseIndex();
	
	return new Promise( async ( resolve, reject ) => {
		if ( retcode !== 0 ) {
			reject( `米游社接口报错: ${ message }` );
			return;
		}
		
		await Redis.setHash( `silvery-star.card-data-${ qqID }`, {
			explorations:   JSON.stringify( data.world_explorations ),
			stats:          JSON.stringify( data.stats ),
			homes:          JSON.stringify( data.homes )
		} );
		await Redis.setTimeout( `silvery-star.card-data-${ qqID }`, 3600 );
		Adachi.logger.info( `用户 ${ uid } 查询成功，数据已缓存` );
		
		const charIDs: number[] = data.avatars.map( el => el.id );
		resolve( charIDs );
	} );
}

async function characterInfoPromise( qqID: number, uid: number, server: string, charIDs: number[] ): Promise<string | void> {
	const { retcode, message, data } = await getCharactersInfo( uid, server, charIDs, cookies.get() );
	cookies.increaseIndex();

	return new Promise( async ( resolve, reject ) => {
		if ( retcode !== 0 ) {
			reject( `米游社接口报错: ${ message }` );
			return;
		}
		
		let avatars: any[] = [];
		const charList: any[] = data.avatars;
		for ( let char of charList ) {
			const base: any = omit( char, [ "image", "weapon", "reliquaries", "constellations" ] );
			const weapon: any = omit( char.weapon, [ "id", "type", "promote_level", "type_name" ] );
			
			let artifacts: any[] = [];

			for ( let pos of char.reliquaries ) {
				const posInfo: any = omit( pos, [ "id", "set", "pos_name" ] );
				artifacts.push( posInfo );
			}
			
			avatars.push( { ...base, weapon, artifacts } );
		}
		
		await Redis.setHash( `silvery-star.card-data-${ qqID }`, {
			avatars: JSON.stringify( avatars )
		} );
		resolve();
	} );
}

async function abyssInfoPromise( qqID: number, uid: number, server: string, period: number ): Promise<string | void> {
	const dbKey: string = `silvery-star.abyss-data-${ qqID }`;
	const detail: string | null = await Redis.getString( dbKey );
	
	if ( detail !== null ) {
		const data: any = JSON.parse( detail );
		if ( data.uid === uid && data.period === period ) {
			Adachi.logger.info( `用户 ${ uid } 在一小时内进行过深渊查询操作，将返回上次数据` );
			return Promise.reject( "gotten" );
		}
	}
	
	const { retcode, message, data } = await getSpiralAbyssInfo( uid, server, period, cookies.get() );
	cookies.increaseIndex();
	
	return new Promise( async ( resolve, reject ) => {
		if ( retcode !== 0 ) {
			reject( `米游社接口报错: ${ message }` );
			return;
		}
		
		await Redis.setString( dbKey, JSON.stringify( { ...data, uid, period } ) );
		await Redis.setTimeout( dbKey, 3600 );
		Adachi.logger.info( `用户 ${ uid } 的深渊数据查询成功，数据已缓存` );
		resolve();
	} );
}

export {
	baseInfoPromise,
	detailInfoPromise,
	characterInfoPromise,
	abyssInfoPromise
}
