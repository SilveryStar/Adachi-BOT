import { Adachi, Redis } from "../../../bot";
import { cookies } from "../init";
import { getBaseInfo, getCharactersInfo, getDailyNoteInfo, getDetailInfo, getSpiralAbyssInfo } from "./api";
import { omit } from "lodash";
import * as ApiType from "../types";
import { Note } from "../types";

enum ErrorMsg {
	NOT_FOUND = "未查询到角色数据，请检查米哈游通行证（非UID）是否有误或是否设置角色信息公开",
	UNKNOWN = "发生未知错误",
	FORM_MESSAGE = "米游社接口报错: "
}

async function baseInfoPromise(
	qqID: number,
	mysID: number
): Promise<string | [ number, string ]> {
	const { retcode, message, data } = await getBaseInfo( mysID, cookies.get() );
	if ( !ApiType.isBBS( data ) ) {
		return Promise.reject( ErrorMsg.UNKNOWN );
	}
	
	return new Promise( async ( resolve, reject ) => {
		if ( retcode !== 0 ) {
			reject( ErrorMsg.FORM_MESSAGE + message );
			return;
		} else if ( !data.list || data.list.length === 0 ) {
			reject( ErrorMsg.NOT_FOUND );
			return;
		}

		const genshinInfo: ApiType.Game | undefined = data.list.find( el => el.gameId === 2 );
		if ( !genshinInfo ) {
			reject( ErrorMsg.NOT_FOUND );
			return;
		}

		const { gameRoleId, nickname, region, level } = genshinInfo;
		const uid: number = parseInt( gameRoleId );

		await Redis.setHash( `silvery-star.card-data-${ qqID }`, { nickname, uid, level } );
		resolve( [ uid, region ] );
	} );
}

async function detailInfoPromise(
	qqID: number,
	uid: number,
	server: string,
	flag: boolean
): Promise<string | number[]> {
	const detail: any = await Redis.getHash( `silvery-star.card-data-${ qqID }` );

	if ( flag && detail.stats !== undefined && uid === parseInt( detail.uid ) ) {
		Adachi.logger.info( `用户 ${ uid } 在一小时内进行过查询操作，将返回上次数据` );
		return Promise.reject( "gotten" );
	}
	
	const { retcode, message, data } = await getDetailInfo( uid, server, cookies.get() );
	cookies.increaseIndex();
	if ( !ApiType.isUserInfo( data ) ) {
		return Promise.reject( ErrorMsg.UNKNOWN );
	}
	
	return new Promise( async ( resolve, reject ) => {
		if ( retcode !== 0 ) {
			reject( ErrorMsg.FORM_MESSAGE + message );
			return;
		}
		
		await Redis.setHash( `silvery-star.card-data-${ qqID }`, {
			explorations:   JSON.stringify( data.worldExplorations ),
			stats:          JSON.stringify( data.stats ),
			homes:          JSON.stringify( data.homes )
		} );
		await Redis.setTimeout( `silvery-star.card-data-${ qqID }`, 3600 );
		Adachi.logger.info( `用户 ${ uid } 查询成功，数据已缓存` );
		
		const charIDs: number[] = data.avatars.map( el => el.id );
		resolve( charIDs );
	} );
}

async function characterInfoPromise(
	qqID: number,
	uid: number,
	server: string,
	charIDs: number[]
): Promise<string | void> {
	const { retcode, message, data } = await getCharactersInfo( uid, server, charIDs, cookies.get() );
	cookies.increaseIndex();
	if ( !ApiType.isCharacter( data ) ) {
		return Promise.reject( ErrorMsg.UNKNOWN );
	}

	return new Promise( async ( resolve, reject ) => {
		if ( retcode !== 0 ) {
			reject( ErrorMsg.FORM_MESSAGE + message );
			return;
		}
		
		let avatars: any[] = [];
		const charList: any[] = data.avatars;
		for ( let char of charList ) {
			const base: any = omit( char, [ "image", "weapon", "reliquaries", "constellations" ] );
			const weapon: any = omit( char.weapon, [ "id", "type", "promoteLevel", "typeName" ] );
			
			let artifacts: any[] = [];

			for ( let pos of char.reliquaries ) {
				const posInfo: any = omit( pos, [ "id", "set", "posName" ] );
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

async function abyssInfoPromise(
	qqID: number,
	uid: number,
	server: string,
	period: number
): Promise<string | void> {
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
	if ( !ApiType.isAbyss( data ) ) {
		return Promise.reject( ErrorMsg.UNKNOWN );
	}
	
	return new Promise( async ( resolve, reject ) => {
		if ( retcode !== 0 ) {
			reject( ErrorMsg.FORM_MESSAGE+ message );
			return;
		}

		await Redis.setString( dbKey, JSON.stringify( { ...data, uid, period } ) );
		await Redis.setTimeout( dbKey, 3600 );
		Adachi.logger.info( `用户 ${ uid } 的深渊数据查询成功，数据已缓存` );
		resolve();
	} );
}

async function dailyNotePromise(
	uid: string,
	server: string,
	cookie: string
): Promise<Note | string> {
	const { retcode, message, data } = await getDailyNoteInfo( parseInt( uid ), server, cookie );
	if ( !ApiType.isNote( data ) ) {
		return Promise.reject( ErrorMsg.UNKNOWN );
	}
	
	return new Promise( ( resolve, reject ) => {
		if ( retcode !== 0 ) {
			reject( ErrorMsg.FORM_MESSAGE+ message );
			return;
		}
		
		Adachi.logger.info( `用户 ${ uid } 的实时便笺数据查询成功` );
		resolve( data );
	} );
}

export {
	ErrorMsg,
	baseInfoPromise,
	detailInfoPromise,
	characterInfoPromise,
	abyssInfoPromise,
	dailyNotePromise
}
