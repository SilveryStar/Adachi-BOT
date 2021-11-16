import * as ApiType from "../types";
import * as api from "./api";
import Database from "@modules/database";
import { Logger } from "log4js";
import { Note } from "../types";
import { omit } from "lodash";
import { cookies } from "../init";

export enum ErrorMsg {
	NOT_FOUND = "未查询到角色数据，请检查米哈游通行证（非UID）是否有误或是否设置角色信息公开",
	UNKNOWN = "发生未知错误",
	FORM_MESSAGE = "米游社接口报错: "
}

export async function baseInfoPromise(
	userID: number,
	mysID: number,
	redis: Database
): Promise<string | [ number, string ]> {
	const { retcode, message, data } = await api.getBaseInfo( mysID, cookies.get() );
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

		await redis.setHash( `silvery-star.card-data-${ userID }`, { nickname, uid, level } );
		resolve( [ uid, region ] );
	} );
}

export async function detailInfoPromise(
	userID: number,
	uid: number,
	server: string,
	flag: boolean,
	logger: Logger,
	redis: Database
): Promise<string | number[]> {
	const detail: any = await redis.getHash( `silvery-star.card-data-${ userID }` );

	if ( flag && detail.stats !== undefined && uid === parseInt( detail.uid ) ) {
		logger.info( `用户 ${ uid } 在一小时内进行过查询操作，将返回上次数据` );
		return Promise.reject( "gotten" );
	}
	
	const { retcode, message, data } = await api.getDetailInfo( uid, server, cookies.get() );
	cookies.increaseIndex();
	if ( !ApiType.isUserInfo( data ) ) {
		return Promise.reject( ErrorMsg.UNKNOWN );
	}
	
	return new Promise( async ( resolve, reject ) => {
		if ( retcode !== 0 ) {
			reject( ErrorMsg.FORM_MESSAGE + message );
			return;
		}
		
		await redis.setHash( `silvery-star.card-data-${ userID }`, {
			explorations:   JSON.stringify( data.worldExplorations ),
			stats:          JSON.stringify( data.stats ),
			homes:          JSON.stringify( data.homes )
		} );
		await redis.setTimeout( `silvery-star.card-data-${ userID }`, 3600 );
		logger.info( `用户 ${ uid } 查询成功，数据已缓存` );
		
		const charIDs: number[] = data.avatars.map( el => el.id );
		resolve( charIDs );
	} );
}

export async function characterInfoPromise(
	userID: number,
	uid: number,
	server: string,
	charIDs: number[],
	redis: Database
): Promise<string | void> {
	const { retcode, message, data } = await api.getCharactersInfo( uid, server, charIDs, cookies.get() );
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
		
		await redis.setHash( `silvery-star.card-data-${ userID }`, {
			avatars: JSON.stringify( avatars )
		} );
		resolve();
	} );
}

export async function abyssInfoPromise(
	userID: number,
	uid: number,
	server: string,
	period: number,
	logger: Logger,
	redis: Database
): Promise<string | void> {
	const dbKey: string = `silvery-star.abyss-data-${ userID }`;
	const detail: string = await redis.getString( dbKey );
	
	if ( detail.length !== 0 ) {
		const data: any = JSON.parse( detail );
		if ( data.uid === uid && data.period === period ) {
			logger.info( `用户 ${ uid } 在一小时内进行过深渊查询操作，将返回上次数据` );
			return Promise.reject( "gotten" );
		}
	}
	
	const { retcode, message, data } = await api.getSpiralAbyssInfo( uid, server, period, cookies.get() );
	cookies.increaseIndex();
	if ( !ApiType.isAbyss( data ) ) {
		return Promise.reject( ErrorMsg.UNKNOWN );
	}

	return new Promise( async ( resolve, reject ) => {
		if ( retcode !== 0 ) {
			reject( ErrorMsg.FORM_MESSAGE+ message );
			return;
		}

		await redis.setString( dbKey, JSON.stringify( { ...data, uid, period } ) );
		await redis.setTimeout( dbKey, 3600 );
		logger.info( `用户 ${ uid } 的深渊数据查询成功，数据已缓存` );
		resolve();
	} );
}

export async function dailyNotePromise(
	uid: string,
	server: string,
	cookie: string,
	logger: Logger
): Promise<Note | string> {
	const { retcode, message, data } = await api.getDailyNoteInfo( parseInt( uid ), server, cookie );
	if ( !ApiType.isNote( data ) ) {
		return Promise.reject( ErrorMsg.UNKNOWN );
	}
	
	return new Promise( ( resolve, reject ) => {
		if ( retcode !== 0 ) {
			reject( ErrorMsg.FORM_MESSAGE+ message );
			return;
		}
		
		logger.info( `用户 ${ uid } 的实时便笺数据查询成功` );
		resolve( data );
	} );
}