import * as ApiType from "../types";
import * as api from "./api";
import bot from "ROOT";
import { Cookies } from "#genshin/module";
import { omit, parseInt } from "lodash";
import { cookies } from "../init";

export enum ErrorMsg {
	NOT_FOUND = "未查询到角色数据，请检查米哈游通行证（非UID）是否有误或是否设置角色信息公开",
	UNKNOWN = "发生未知错误",
	FORM_MESSAGE = "米游社接口报错: "
}

export async function baseInfoPromise(
	userID: number,
	mysID: number,
	cookie: string = ""
): Promise<string> {
	const { retcode, message, data } = await api.getBaseInfo(
		mysID, cookie ? cookie : cookies.get()
	);
	if ( !ApiType.isBBS( data ) ) {
		return Promise.reject( ErrorMsg.UNKNOWN );
	}
	
	return new Promise( async ( resolve, reject ) => {
		if ( retcode === 10001 ) {
			reject( Cookies.checkExpired( cookie ) );
			return;
		} else if ( retcode !== 0 ) {
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

		await bot.redis.setString( `silvery-star.user-querying-id-${ userID }`, uid );
		await bot.redis.setHash( `silvery-star.card-data-${ uid }`, { nickname, uid, level } );
		resolve( region );
	} );
}

export async function detailInfoPromise(
	userID: number,
	server: string,
	cookie: string = ""
): Promise<string | number[]> {
	const UID: string = await bot.redis.getString( `silvery-star.user-querying-id-${ userID }` );
	if ( UID.length === 0 ) {
		return Promise.reject( ErrorMsg.UNKNOWN );
	}
	
	const detail: any = await bot.redis.getHash( `silvery-star.card-data-${ UID }` );
	const uid: number = parseInt( UID );

	if ( detail.stats && uid === parseInt( detail.uid ) ) {
		if ( !cookie || ( detail.avatars && JSON.parse( detail.avatars ).length > 8 ) ) {
			bot.logger.info( `用户 ${ uid } 在一小时内进行过查询操作，将返回上次数据` );
			return Promise.reject( "gotten" );
		}
	}
	
	if ( cookie.length === 0 ) {
		cookie = cookies.get();
		cookies.increaseIndex();
	}
	const { retcode, message, data } = await api.getDetailInfo( uid, server, cookie );
	if ( !ApiType.isUserInfo( data ) ) {
		return Promise.reject( ErrorMsg.UNKNOWN );
	}
	
	return new Promise( async ( resolve, reject ) => {
		if ( retcode === 10001 ) {
			reject( Cookies.checkExpired( cookie ) );
			return;
		} else if ( retcode !== 0 ) {
			reject( ErrorMsg.FORM_MESSAGE + message );
			return;
		} else if ( data.avatars.length === 0 ) {
			reject( `玩家 UID${ uid } 的信息有误` );
			return;
		}
		
		await bot.redis.setHash( `silvery-star.card-data-${ uid }`, {
			explorations:   JSON.stringify( data.worldExplorations ),
			stats:          JSON.stringify( data.stats ),
			homes:          JSON.stringify( data.homes )
		} );
		await bot.redis.setTimeout( `silvery-star.card-data-${ uid }`, 3600 );
		bot.logger.info( `用户 ${ uid } 查询成功，数据已缓存` );
		
		const charIDs: number[] = data.avatars.map( el => el.id );
		resolve( charIDs );
	} );
}

export async function characterInfoPromise(
	userID: number,
	server: string,
	charIDs: number[],
	cookie: string = ""
): Promise<string | void> {
	const uid: number = parseInt( await bot.redis.getString( `silvery-star.user-querying-id-${ userID }` ) );
	
	if ( cookie.length === 0 ) {
		cookie = cookies.get();
	}
	const { retcode, message, data } = await api.getCharactersInfo( uid, server, charIDs, cookie );
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
		
		await bot.redis.setHash( `silvery-star.card-data-${ uid }`, {
			avatars: JSON.stringify( avatars )
		} );
		resolve();
	} );
}

export async function mysInfoPromise(
	userID: number,
	mysID: number,
	cookie: string
): Promise<void> {
	const server: string = await baseInfoPromise( userID, mysID, cookie );
	const charIDs = <number[]>await detailInfoPromise( userID, server, cookie );
	await characterInfoPromise( userID, server, charIDs, cookie );
}

export async function abyssInfoPromise(
	userID: number,
	server: string,
	period: number,
	cookie: string = ""
): Promise<string | void> {
	const uid: number = parseInt(
		await bot.redis.getString( `silvery-star.abyss-querying-${ userID }` )
	);
	const dbKey: string = `silvery-star.abyss-data-${ uid }`;
	const detail: string = await bot.redis.getString( dbKey );
	
	if ( detail.length !== 0 ) {
		const data: any = JSON.parse( detail );
		if ( data.uid === uid && data.period === period ) {
			bot.logger.info( `用户 ${ uid } 在一小时内进行过深渊查询操作，将返回上次数据` );
			return Promise.reject( "gotten" );
		}
	}
	
	if ( cookie.length === 0 ) {
		cookie = cookies.get();
		cookies.increaseIndex();
	}
	const { retcode, message, data } = await api.getSpiralAbyssInfo( uid, server, period, cookie );
	if ( !ApiType.isAbyss( data ) ) {
		return Promise.reject( ErrorMsg.UNKNOWN );
	}

	return new Promise( async ( resolve, reject ) => {
		if ( retcode === 10001 ) {
			reject( Cookies.checkExpired( cookie ) );
			return;
		} else if ( retcode !== 0 ) {
			reject( ErrorMsg.FORM_MESSAGE+ message );
			return;
		}

		await bot.redis.setString( dbKey, JSON.stringify( { ...data, uid, period } ) );
		await bot.redis.setTimeout( dbKey, 3600 );
		bot.logger.info( `用户 ${ uid } 的深渊数据查询成功，数据已缓存` );
		resolve();
	} );
}

export async function dailyNotePromise(
	uid: string,
	server: string,
	cookie: string
): Promise<ApiType.Note> {
	return new Promise( async ( resolve, reject ) => {
		try {
			const { retcode, message, data } = await api.getDailyNoteInfo(
				parseInt( uid ), server, cookie
			);
			if ( !ApiType.isNote( data ) ) {
				return reject( ErrorMsg.UNKNOWN );
			}
			
			if ( retcode === 10001 ) {
				reject( Cookies.checkExpired( cookie ) );
				return;
			} else if ( retcode !== 0 ) {
				reject( ErrorMsg.FORM_MESSAGE + message );
				return;
			}
			
			bot.logger.info( `用户 ${ uid } 的实时便笺数据查询成功` );
			resolve( data );
		} catch ( error ) {
			reject( "便笺数据查询错误，可能服务器出现了网络波动或米游社API故障，请联系持有者进行反馈" );
		}
	} );
}

export async function signInInfoPromise(
	uid: string,
	server: string,
	cookie: string
): Promise<ApiType.SignInInfo | string> {
	const { retcode, message, data } = await api.getSignInInfo( uid, server, cookie );
	if ( !ApiType.isSignInInfo( data ) ) {
		return Promise.reject( ErrorMsg.UNKNOWN );
	}
	
	return new Promise( ( resolve, reject ) => {
		if ( retcode === -100 ) {
			reject( Cookies.checkExpired( cookie ) );
			return;
		} else if ( retcode !== 0 ) {
			reject( ErrorMsg.FORM_MESSAGE + message );
			return;
		}
		
		bot.logger.info( `用户 ${ uid } 的米游社签到数据查询成功` );
		resolve( data );
	} );
}

export async function signInResultPromise(
	uid: string,
	server: string,
	cookie: string
): Promise<ApiType.SignInResult | string> {
	const { retcode, message, data } = await api.mihoyoBBSSignIn( uid, server, cookie );
	if ( !ApiType.isSignInResult( data ) ) {
		return Promise.reject( ErrorMsg.UNKNOWN );
	}
	
	return new Promise( ( resolve, reject ) => {
		if ( retcode === -100 ) {
			reject( Cookies.checkExpired( cookie ) );
			return;
		} else if ( retcode !== 0 ) {
			reject( ErrorMsg.FORM_MESSAGE + message );
			return;
		}
		
		bot.logger.info( `用户 ${ uid } 今日米游社签到成功` );
		resolve( data );
	} );
}