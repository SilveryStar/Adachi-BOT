import { MemberBaseInfo } from "oicq";
import { AuthLevel } from "@modules/management/auth";
import express from "express";
import bot from "ROOT";

type UserInfo = {
	userID: number;
	avatar: string;
	nickname: string;
	isFriend: boolean;
	botAuth: AuthLevel;
	interval: number;
	limits: string[];
	groupInfoList: ( string | MemberBaseInfo )[];
}

export default express.Router()
	.get( "/list", async ( req, res ) => {
		const page = parseInt( <string>req.query.page ); // 当前第几页
		const length = parseInt( <string>req.query.length ); // 页长度
		
		if ( !page || !length ) {
			res.status( 400 ).send( { code: 400, data: {}, msg: "Error Params" } );
			return;
		}
		
		const userId = <string>req.query.userId || "";
		
		try {
			let userData: string[] = await bot.redis.getKeysByPrefix( "adachi.user-used-groups-" );
			const cmdKeys: string[] = bot.command.cmdKeys;
			
			// 过滤条件：id
			if ( userId ) {
				userData = userData.filter( ( userKey: string ) => userKey.includes( userId ) );
			}
			
			const filterUserKeys = userData.slice( ( page - 1 ) * length, page * length );
			
			let userInfos: UserInfo[] = []
			
			for ( const userKey of filterUserKeys ) {
				const userID: string = <string>userKey.split( "-" ).pop();
				const userInfo: UserInfo = await getUserInfo( parseInt( userID ) );
				userInfos.push( userInfo )
			}
			
			userInfos = userInfos.sort( ( prev, next ) => next.botAuth - prev.botAuth );
			
			res.status( 200 ).send( { code: 200, data: { userInfos, cmdKeys }, total: userData.length } );
		} catch ( error ) {
			res.status( 500 ).send( { code: 500, data: {}, msg: "Server Error" } );
		}
		
	} )
	.get( "/info", async ( req, res ) => {
		const userID: number = parseInt( <string>req.query.id );
		const userInfo = await getUserInfo( userID );
		
		res.status( 200 ).send( JSON.stringify( userInfo ) );
	} )
	.post( "/set", async ( req, res ) => {
		const userID: number = parseInt( <string>req.body.target );
		const int: number = parseInt( <string>req.body.int );
		const auth = <AuthLevel>parseInt( <string>req.body.auth );
		const limits: string[] = JSON.parse( <string>req.body.limits );
		
		await bot.auth.set( userID, auth );
		await bot.interval.set( userID, "private", int );
		
		const dbKey: string = `adachi.user-command-limit-${ userID }`;
		await bot.redis.deleteKey( dbKey );
		if ( limits.length !== 0 ) {
			await bot.redis.addListElement( dbKey, ...limits );
		}
		
		res.status( 200 ).send( "success" );
	} );

/* 获取用户信息 */
async function getUserInfo( userID: number ): Promise<UserInfo> {
	const avatar = `https://q1.qlogo.cn/g?b=qq&s=640&nk=${ userID }`;
	const publicInfo = await bot.client.getStrangerInfo( userID );
	const isFriend: boolean = bot.client.fl.get( userID ) !== undefined;
	const botAuth: AuthLevel = await bot.auth.get( userID );
	const interval: number = bot.interval.get( userID, -1 );
	const limits: string[] = await bot.redis.getList( `adachi.user-command-limit-${ userID }` );
	
	let nickname: string = "";
	const groupInfoList: Array<MemberBaseInfo | string> = [];
	
	if ( publicInfo.retcode === 0 ) {
		const usedGroups: string[] = await bot.redis.getSet( `adachi.user-used-groups-${ userID }` );
		nickname = publicInfo.data.nickname;
		
		for ( let el of usedGroups ) {
			const groupID: number = parseInt( el );
			if ( groupID === -1 ) {
				groupInfoList.push( "私聊方式使用" );
				continue;
			}
			const data = await bot.client.getGroupMemberInfo( groupID, userID );
			if ( data.retcode === 0 ) {
				groupInfoList.push( data.data );
			}
		}
	}
	return { userID, avatar, nickname, isFriend, botAuth, interval, limits, groupInfoList }
}