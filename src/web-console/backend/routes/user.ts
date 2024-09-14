import bot from "ROOT";
import express from "express";
import { AuthLevel } from "@/modules/management/auth";
import PluginManager from "@/modules/plugin";
import { UserInfo } from "../types/user";
import { sleep } from "@/utils/async";
import { getRandomNumber } from "@/utils/random";
import { formatSubUsers } from "@/web-console/backend/utils/format";
import { GroupMemberInfo } from "@/modules/lib";
import { RequestParamsError } from "@/web-console/backend/utils/error";

export default express.Router()
	.get( "/list", async ( req, res, next ) => {
		debugger;
		const page = parseInt( <string>req.query.page ); // 当前第几页
		const length = parseInt( <string>req.query.length ); // 页长度
		
		if ( !page || !length ) {
			return next( new RequestParamsError() );
		}
		
		const userId = <string>req.query.userId || "";
		/* 是否存在订阅，1 有 2 无 */
		const sub = parseInt( <string>req.query.sub );
		
		try {
			/* 用户订阅信息 */
			const userSubData: Record<string, string[]> = await formatSubUsers( bot, "private" );
			
			let userData: string[] = await bot.redis.getKeysByPrefix( "adachi.user-used-groups-" );
			console.log( userData )
			userData = userData.map( ( userKey: string ) => <string>userKey.split( "-" ).pop() )
			console.log( userData )
			
			const cmdKeys: string[] = bot.command.cmdKeys;
			
			// 过滤条件：id
			if ( userId ) {
				userData = userData.filter( ( userKey: string ) => userKey.includes( userId ) );
			}
			/* 过滤条件：订阅 */
			if ( sub === 1 ) {
				userData = userData.filter( ( userKey: string ) => Object.keys( userSubData ).includes( userKey ) );
			} else if ( sub === 2 ) {
				userData = userData.filter( ( userKey: string ) => !Object.keys( userSubData ).includes( userKey ) );
			}
			
			const filterUserKeys = userData.slice( ( page - 1 ) * length, page * length );
			const results = await Promise.all( filterUserKeys.map( userKey => getUserInfo( parseInt( userKey ) ) ) );
			const userInfos = results
				.map( info => ( {
					...info,
					subInfo: userSubData[ info.userID ] || []
				} ) )
				.sort( ( prev, next ) => next.botAuth - prev.botAuth );
			
			res.status( 200 ).send( { code: 200, data: { userInfos, cmdKeys }, total: userData.length } );
		} catch ( error ) {
			next( error );
		}
		
	} )
	.get( "/info", async ( req, res, next ) => {
		const userID: number = parseInt( <string>req.query.id );
		if ( userID ) {
			return next( new RequestParamsError() );
		}
		try {
			const userInfo = await getUserInfo( userID );
			res.status( 200 ).send( JSON.stringify( userInfo ) );
		} catch ( error ) {
			next( error );
		}
	} )
	.post( "/set", async ( req, res, next ) => {
		const userID: number = parseInt( <string>req.body.target );
		const int: number = parseInt( <string>req.body.int );
		const auth = <AuthLevel>parseInt( <string>req.body.auth );
		const limits: string[] = JSON.parse( <string>req.body.limits );
		
		try {
			await bot.auth.set( userID, auth );
			await bot.interval.set( userID, "private", int );
			
			const dbKey: string = `adachi.user-command-limit-${ userID }`;
			await bot.redis.deleteKey( dbKey );
			if ( limits.length !== 0 ) {
				await bot.redis.addListElement( dbKey, ...limits );
			}
			
			res.status( 200 ).send( "success" );
		} catch ( error ) {
			next( error );
		}
	} )
	.post( "/sub/remove", async ( req, res, next ) => {
		const userId = req.body.userId;
		if ( !userId ) {
			return next( new RequestParamsError() );
		}
		try {
			// 清空订阅
			PluginManager.getInstance().remSub( "private", userId );
			res.status( 200 ).send( { code: 200, data: {}, msg: "Success" } );
		} catch ( error ) {
			next( error );
		}
	} )
	.post( "/remove/batch", async ( req, res, next ) => {
		const userIds: number[] = req.body.userIds;
		if ( !userIds ) {
			return next( new RequestParamsError() );
		}
		
		try {
			let first: boolean = true;
			for ( const id of userIds ) {
				if ( !first ) {
					await sleep( getRandomNumber( 100, 1000 ) );
				}
				// 删除好友
				const result = await bot.client.deleteFriend( id );
				if ( result.retcode === 1404 ) {
					return next( new Error( "当前实现端不支持删除好友操作" ) );
				}
				// 清除数据库
				await bot.redis.deleteKey( `adachi.user-used-groups-${ id }` );
				first = false;
			}
			await bot.client.reloadFriendList();
			res.status( 200 ).send( { code: 200, data: {}, msg: "Success" } );
		} catch ( error ) {
			next( error );
		}
	} )

async function getUserInfo( userID: number ): Promise<UserInfo> {
	const avatar = `https://q1.qlogo.cn/g?b=qq&s=640&nk=${ userID }`;
	
	const isFriend: boolean = bot.client.fl.get( userID ) !== undefined;
	const botAuth: AuthLevel = await bot.auth.get( userID );
	const interval: number = bot.interval.get( userID, "private" );
	const limits: string[] = await bot.redis.getList( `adachi.user-command-limit-${ userID }` );
	
	
	const usedGroups: string[] = await bot.redis.getSet( `adachi.user-used-groups-${ userID }` );
	
	const memberInfoResponseList: Promise<GroupMemberInfo | string>[] = usedGroups.map( async el => {
		const groupID: number = Number.parseInt( el );
		if ( groupID === -1 ) {
			return "私聊方式使用";
		}
		const res = await bot.client.getGroupMemberInfo( groupID, userID );
		return res.retcode === 0 ? res.data : "";
	} );
	
	const publicInfoRequest = async () => {
		const res = await bot.client.getStrangerInfo( userID );
		return res.retcode === 0 ? res.data.nickname : "";
	}
	
	let groupInfoList: Array<GroupMemberInfo | string> = await Promise.all( [ publicInfoRequest(), ...memberInfoResponseList ] );
	const nickname = <string>groupInfoList[0];
	
	groupInfoList = groupInfoList.slice(1).filter( el => !!el );
	
	return { userID, avatar, nickname, isFriend, botAuth, interval, limits, groupInfoList }
}