import { MemberBaseInfo } from "oicq";
import { AuthLevel } from "@modules/management/auth";
import express from "express";
import bot from "ROOT";

export default express.Router()
	.get( "/list", async ( req, res ) => {
		const userData: string[] = await bot.redis.getKeysByPrefix( "adachi.user-used-groups-" );
		const cmdKeys: string[] = bot.command.cmdKeys;
		
		const userIDs: string[] = [];
		for ( let userKey of userData ) {
			const userID: string = <string>userKey.split( "-" ).pop();
			userIDs.push( userID );
		}
		res.status( 200 ).send( JSON.stringify( { userIDs, cmdKeys } ) );
	} )
	.get( "/info", async ( req, res ) => {
		const userID: number = parseInt( <string>req.query.id );
		const publicInfo = await bot.client.getStrangerInfo( userID );
		const isFriend: boolean = bot.client.fl.get( userID ) !== undefined;
		const botAuth: AuthLevel = await bot.auth.get( userID );
		const interval: number = bot.interval.get( userID, -1 );
		const limits: string[] = await bot.redis.getList( `adachi.user-command-limit-${ userID }` );
		
		if ( publicInfo.retcode === 0 ) {
			const nickname: string = publicInfo.data.nickname;
			const usedGroups: string[] = await bot.redis.getSet( `adachi.user-used-groups-${ userID }` );
			const groupInfoList: Array<MemberBaseInfo | string> = [];
			
			for( let el of usedGroups ) {
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
			res.status( 200 ).send( JSON.stringify( {
				userID, nickname, isFriend, botAuth, interval, limits, groupInfoList
			} ) );
		} else {
			res.status( 200 ).send( JSON.stringify( {
				userID, nickname: "", isFriend, botAuth, interval, limits, groupInfoList: []
			} ) );
		}
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