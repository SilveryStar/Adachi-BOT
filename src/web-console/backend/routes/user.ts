import bot from "ROOT";
import express from "express";
import { AuthLevel } from "@modules/management/auth";
import { MemberBaseInfo } from "oicq";
import { BOT } from "@modules/bot";
import { PluginReSubs, SubInfo } from "@modules/plugin";

type UserInfo = {
	userID: number;
	avatar: string;
	nickname: string;
	isFriend: boolean;
	botAuth: AuthLevel;
	interval: number;
	limits: string[];
	groupInfoList: ( string | MemberBaseInfo )[];
	subInfo?: string[]
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
		/* 是否存在订阅，1 有 2 无 */
		const sub = parseInt( <string>req.query.sub );
		
		try {
			/* 用户订阅信息 */
			const userSubData: Record<string, string[]> = await formatSubUsers( bot );
			
			let userData: string[] = await bot.redis.getKeysByPrefix( "adachi.user-used-groups-" );
			userData = userData.map( ( userKey: string ) => <string>userKey.split( "-" ).pop() )
			
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
			
			let userInfos: UserInfo[] = []
			
			for ( const userKey of filterUserKeys ) {
				const userInfo: UserInfo = await getUserInfo( parseInt( userKey ) );
				userInfos.push( { ...userInfo, subInfo: userSubData[userKey] || [] } );
			}
			
			userInfos = userInfos.sort( ( prev, next ) => next.botAuth - prev.botAuth );
			
			res.status( 200 ).send( { code: 200, data: { userInfos, cmdKeys }, total: userData.length } );
		} catch ( error ) {
			res.status( 500 ).send( { code: 500, data: {}, msg: "Server Error" } );
		}
		
	} )
	.get( "/info", async ( req, res ) => {
		const userID: number = parseInt( <string>req.query.id );
		if ( userID ) {
			res.status( 400 ).send( { code: 400, data: {}, msg: "Error Params" } );
			return;
		}
		
		const userInfo = await getUserInfo( userID );
		
		res.status( 200 ).send( JSON.stringify( userInfo ) );
	} )
	.post( "/set", async ( req, res ) => {
		const userID: number = parseInt( <string>req.body.target );
		const int: number = parseInt( <string>req.body.int );
		const auth = <AuthLevel>parseInt( <string>req.body.auth );
		const limits: string[] = JSON.parse( <string>req.body.limits );
		
		console.log(userID, int, auth)
		
		await bot.auth.set( userID, auth );
		await bot.interval.set( userID, "private", int );
		
		const dbKey: string = `adachi.user-command-limit-${ userID }`;
		await bot.redis.deleteKey( dbKey );
		if ( limits.length !== 0 ) {
			await bot.redis.addListElement( dbKey, ...limits );
		}
		
		res.status( 200 ).send( "success" );
	} )
	.delete( "/sub/remove", async ( req, res ) => {
		const userId = parseInt( <string>req.query.userId );
		
		try {
			if ( !userId ) {
				res.status( 400 ).send( { code: 400, data: [], msg: "Error Params" } );
				return;
			}
			for ( const plugin in PluginReSubs ) {
				try {
					await PluginReSubs[plugin].reSub( userId, bot );
				} catch ( error ) {
					bot.logger.error( `插件${ plugin }取消订阅事件执行异常：${ <string>error }` )
				}
			}
			res.status( 200 ).send( { code: 200, data: {}, msg: "Success" } );
		} catch ( error ) {
			res.status( 500 ).send( { code: 500, data: [], msg: "Server Error" } );
		}
	} )

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

/* 生成订阅用户id列表 */
async function formatSubUsers( bot: BOT ): Promise<Record<string, string[]>> {
	const userSubs: Record<string, string[]> = {};
	
	for ( const pluginName in PluginReSubs ) {
		const { subs } = PluginReSubs[pluginName];
		try {
			const subList: SubInfo[] = await subs( bot );
			if ( subList ) {
				for ( const subItem of subList ) {
					for ( const user of subItem.users ) {
						if ( userSubs[user] ) {
							userSubs[user].push( `${ pluginName }-${ subItem.name }` );
						} else {
							userSubs[user] = [ `${ pluginName }-${ subItem.name }` ];
						}
					}
				}
			}
		} catch ( error ) {
			bot.logger.error( `获取插件订阅信息异常: ${ <string>error }` );
		}
	}
	
	return userSubs;
}