import * as ApiType from "../types";
import * as api from "./api";
import bot from "ROOT";
import { Cookies } from "#genshin/module";
import { omit, pick } from "lodash";
import { characterID, cookies } from "../init";
import { CharacterCon, Abyss } from "../types";

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
): Promise<number[]> {
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
	const allHomes = await api.getUidHome();
	
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
			homes:          JSON.stringify( data.homes ),
			allHomes:       JSON.stringify( allHomes )
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
): Promise<void> {
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
		
		const avatars: ApiType.CharacterInformation[] = [];
		const charList: ApiType.Avatar[] = data.avatars;
		for ( const char of charList ) {
			const base: ApiType.CharacterBase = omit(
				char, [ "image", "weapon", "reliquaries", "constellations" ]
			);
			const weapon: ApiType.CharacterWeapon = {
				...omit( char.weapon, [ "id", "type", "promoteLevel", "typeName" ] ),
				image: `https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/weapon/${ encodeURI( char.weapon.name ) }.png`
			};
			const artifacts: ApiType.CharacterArt = char.reliquaries.map( el => {
				return pick( el, [ "pos", "rarity", "icon", "level" ] );
			} );
			const constellations: ApiType.CharacterCon = {
				detail: char.constellations.map( el => {
					return pick( el, [ "name", "icon", "isActived" ] )
				} ),
				activedNum: char.activedConstellationNum,
				upSkills: char.constellations.reduce( ( pre, cur ) => {
					const reg: RegExp = /<color=#\w+?>(?<name>.+?)<\/color>的技能等级提高(?<level>\d+)级/;
					const res: RegExpExecArray | null = reg.exec( cur.effect );
					if ( res ) {
						const groups = <{ name: string; level: string; }>res.groups;
						pre.push( {
							skillName: groups.name,
							level: parseInt( groups.level ),
							requirementNum: cur.pos
						} );
					}
					return pre;
				}, <ApiType.CharacterConSkill[]>[] )
			};
			
			const tmpSetBucket: Record<string, ApiType.ArtifactSetStat> = {};
			for ( const pos of char.reliquaries ) {
				const id: string = pos.set.name;
				const t = tmpSetBucket[id];
				tmpSetBucket[id] = {
					count: t?.count ? t.count + 1 : 1,
					effect: t?.effect ?? pos.set.affixes,
					icon: t?.icon ?? pos.icon.replace( /\d\.png/, "4.png" )
				};
			}
			const effects: ApiType.CharacterEffect = [];
			for ( const key of Object.keys( tmpSetBucket ) ) {
				const { count, effect, icon } = tmpSetBucket[key];
				effect.forEach( ( { activationNumber: num } ) => {
					if ( count >= num ) {
						const name: string = `${ key } ${ num } 件套`;
						effects.push( { icon, name } );
					}
				} )
			}
			
			avatars.push( { ...base, weapon, constellations, artifacts, effects } );
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

export async function mysAvatarDetailInfoPromise(
	uid: string,
	avatar: number,
	server: string,
	cookie: string,
	constellation: CharacterCon
): Promise<ApiType.Skills> {
	const { retcode, message, data } = await api.getAvatarDetailInfo( uid, avatar, server, cookie );
	if ( !ApiType.isAvatarDetail( data ) ) {
		return Promise.reject( ErrorMsg.UNKNOWN );
	}
	
	return new Promise( async ( resolve, reject ) => {
		if ( retcode !== 0 ) {
			reject( ErrorMsg.FORM_MESSAGE + message );
			return;
		}
		
		const skills = data.skillList
			.filter( el => el.levelCurrent !== 0 && el.maxLevel !== 1 )
			.map( el => {
				const temp: ApiType.Skills[number] = pick( el, [ "name", "icon", "levelCurrent" ] );
				constellation.upSkills.forEach( v => {
					if ( temp.name === v.skillName && constellation.activedNum >= v.requirementNum ) {
						temp.levelCurrent += v.level;
					}
				} );
				
				if ( /^普通攻击·(.+?)/.test( temp.name ) ) {
					temp.name = temp.name.slice( 5 );
				}
				
				return temp;
			} );
		
		resolve( skills );
	} );
}

export async function abyssInfoPromise(
	userID: number,
	server: string,
	period: number,
	cookie: string = ""
): Promise<void> {
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
	let { retcode, message, data } = await api.getSpiralAbyssInfo( uid, server, period, cookie );
	if ( !ApiType.isAbyss( data ) ) {
		return Promise.reject( ErrorMsg.UNKNOWN );
	}
	
	const idMap: Record<number, string> = {};
	
	for ( const name in characterID.map ) {
		const id = characterID.map[name];
		idMap[id] = name;
	}
	
	const getRankWithName = <T extends { avatarId: number }>( rankList: T[] ) => rankList.map( r => {
		return {
			...r,
			name: idMap[r.avatarId]
		}
	} )
	
	data = {
		...data,
		revealRank: getRankWithName(data.revealRank),
		defeatRank: getRankWithName(data.defeatRank),
		takeDamageRank: getRankWithName(data.takeDamageRank),
		normalSkillRank: getRankWithName(data.normalSkillRank),
		energySkillRank: getRankWithName(data.energySkillRank),
		damageRank: getRankWithName(data.damageRank),
	}
	
	return new Promise( async ( resolve, reject ) => {
		if ( retcode === 10001 ) {
			reject( Cookies.checkExpired( cookie ) );
			return;
		} else if ( retcode !== 0 ) {
			reject( ErrorMsg.FORM_MESSAGE + message );
			return;
		}
		
		await bot.redis.setString( dbKey, JSON.stringify( { ...data, uid, period } ) );
		await bot.redis.setTimeout( dbKey, 3600 );
		bot.logger.info( `用户 ${ uid } 的深渊数据查询成功，数据已缓存` );
		resolve();
	} );
}

export async function ledgerPromise(
	uid: string,
	server: string,
	month: number,
	cookie: string = ""
): Promise<void> {
	const dbKey: string = `silvery-star.ledger-data-${ uid }`;
	const detail: string = await bot.redis.getString( dbKey );
	
	if ( detail.length !== 0 ) {
		const data: any = JSON.parse( detail );
		if ( uid === data.uid.toString() && month === data.dataMonth ) {
			bot.logger.info( `用户 ${ uid } 在六小时内进行过札记查询操作，将返回上次数据` );
			return Promise.reject( "gotten" );
		}
	}
	
	if ( cookie.length === 0 ) {
		cookie = cookies.get();
		cookies.increaseIndex();
	}
	const { retcode, message, data } = await api.getLedger( uid, server, month, cookie );
	if ( !ApiType.isLedger( data ) ) {
		return Promise.reject( ErrorMsg.UNKNOWN );
	}
	
	return new Promise( async ( resolve, reject ) => {
		if ( retcode === 10001 ) {
			reject( Cookies.checkExpired( cookie ) );
			return;
		} else if ( retcode !== 0 ) {
			reject( ErrorMsg.FORM_MESSAGE + message );
			return;
		}
		
		await bot.redis.setString( dbKey, JSON.stringify( data ) );
		await bot.redis.setTimeout( dbKey, 21600 );
		bot.logger.info( `用户 ${ uid } 的札记数据查询成功，数据已缓存` );
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
): Promise<ApiType.SignInInfo> {
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
): Promise<ApiType.SignInResult> {
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