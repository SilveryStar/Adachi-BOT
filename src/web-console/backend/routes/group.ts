import bot from "ROOT";
import express from "express";
import { GroupInfo } from "@/modules/lib";
import { GroupData } from "@/web-console/types/group";
import { sleep } from "@/utils/async";
import { getRandomNumber } from "@/utils/random";
import { formatSubUsers } from "@/web-console/backend/utils/format";
import PluginManager from "@/modules/plugin";

export default express.Router()
	.get( "/list", async ( req, res ) => {
		const page = parseInt( <string>req.query.page ); // 当前第几页
		const length = parseInt( <string>req.query.length ); // 页长度
		
		if ( !page || !length ) {
			res.status( 400 ).send( { code: 400, data: {}, msg: "Error Params" } );
			return;
		}
		
		const groupId = <string>req.query.groupId || "";
		/* 是否存在订阅，1 有 2 无 */
		const sub = parseInt( <string>req.query.sub );
		
		try {
			/* 用户订阅信息 */
			const userSubData: Record<string, string[]> = await formatSubUsers( bot, "group" );
			
			let groupData: [ number, GroupInfo ][] = Array.from( bot.client.gl );
			
			// 过滤条件：id
			if ( groupId ) {
				groupData = groupData.filter( ( [ key ] ) => key === parseInt( groupId ) );
			}
			/* 过滤条件：订阅 */
			if ( sub === 1 ) {
				groupData = groupData.filter( ( [ key ] ) => Object.keys( userSubData ).includes( key.toString() ) );
			} else if ( sub === 2 ) {
				groupData = groupData.filter( ( [ key ] ) => !Object.keys( userSubData ).includes( key.toString() ) );
			}
			
			const pageGroupData = groupData.slice( ( page - 1 ) * length, page * length );
			
			const groupInfos: GroupData[] = [];
			
			for ( const [ _, info ] of pageGroupData ) {
				const groupInfo: GroupData | undefined = await getGroupInfo( info );
				if ( groupInfo ) {
					groupInfos.push( { ...groupInfo, subInfo: userSubData[groupInfo.groupId] || [] } );
				}
			}
			
			const cmdKeys: string[] = bot.command.cmdKeys;
			res.status( 200 ).send( { code: 200, data: { groupInfos, cmdKeys }, total: groupData.length } );
		} catch ( error: any ) {
			res.status( 500 ).send( { code: 500, data: {}, msg: error.message || "Server Error" } );
		}
		
	} )
	.get( "/info", async ( req, res ) => {
		const groupId: number = parseInt( <string>req.query.groupId );
		if ( groupId ) {
			res.status( 400 ).send( { code: 400, data: {}, msg: "Error Params" } );
			return;
		}
		
		const groupData = bot.client.gl.get( groupId );
		if ( !groupData ) {
			res.status( 404 ).send( { code: 404, data: {}, msg: "NotFound" } );
			return
		}
		
		const groupInfo: GroupData | undefined = await getGroupInfo( groupData );
		
		if ( groupInfo ) {
			res.status( 200 ).send( { code: 200, data: groupInfo } );
		} else {
			res.status( 404 ).send( { code: 404, data: {}, msg: "Not Found" } );
		}
	} )
	.post( "/set", async ( req, res ) => {
		const groupId: number = parseInt( <string>req.body.target );
		const int: number = parseInt( <string>req.body.int );
		const auth = <1 | 2>parseInt( <string>req.body.auth );
		const limits: string[] = JSON.parse( <string>req.body.limits );
		
		/* 封禁相关 */
		const banDbKey = "adachi.banned-group";
		if ( auth === 1 ) {
			await bot.redis.addListElement( banDbKey, groupId.toString() );
		} else {
			await bot.redis.delListElement( banDbKey, groupId.toString() );
		}
		
		await bot.interval.set( groupId, "private", int );
		
		const dbKey: string = `adachi.group-command-limit-${ groupId }`;
		await bot.redis.deleteKey( dbKey );
		if ( limits.length !== 0 ) {
			await bot.redis.addListElement( dbKey, ...limits );
		}
		
		res.status( 200 ).send( "success" );
	} )
	.post( "/sub/remove", async ( req, res ) => {
		const groupId = req.body.groupId;
		if ( !groupId ) {
			res.status( 400 ).send( { code: 400, data: [], msg: "Error Params" } );
			return;
		}
		
		try {
			// 清空订阅
			PluginManager.getInstance().remSub( "group", groupId );
			res.status( 200 ).send( { code: 200, data: {}, msg: "Success" } );
		} catch ( error: any ) {
			res.status( 500 ).send( { code: 500, data: [], msg: error.message || "Server Error" } );
		}
	} )
	.post( "/send/batch", async ( req, res ) => {
		const content: string = <string>req.body.content;
		const groupIds: number[] | undefined = req.body.groupIds;
		
		if ( !content || ( groupIds && !( [] instanceof Array ) ) ) {
			res.status( 400 ).send( { code: 400, data: {}, msg: "Error Params" } );
			return;
		}
		
		const timoutDbKey = "adachi.batch-send-timeout";
		const nextUseTime: number = parseInt( await bot.redis.getString( timoutDbKey ) );
		if ( new Date().getTime() <= nextUseTime ) {
			res.status( 400 ).send( { code: 400, data: {}, msg: "In cool down time" } );
			return;
		}
		
		// 递增发送延迟，发送次数
		let delayTimer: number = 0, sendCount: number = 0;
		/* 向选中列表发送，否则向全部群聊发送 */
		if ( groupIds && groupIds.length !== 0 ) {
			groupIds.forEach( groupId => {
				sendCount++
				delayTimer = sendToGroupMsg( groupId, content, delayTimer, sendCount );
			} )
		} else {
			const groupList = bot.client.gl;
			groupList.forEach( ( _, groupId ) => {
				sendCount++
				delayTimer = sendToGroupMsg( groupId, content, delayTimer, sendCount );
			} )
		}
		const cdTime = new Date().getTime() + delayTimer;
		await bot.redis.setString( timoutDbKey, cdTime );
		res.status( 200 ).send( { code: 200, data: { cdTime }, msg: "Success" } );
	} )
	.post( "/exit", async ( req, res ) => {
		const groupId: number = req.body.groupId;
		if ( !groupId ) {
			res.status( 400 ).send( { code: 400, data: [], msg: "Error Params" } );
			return;
		}
		
		try {
			await bot.client.setGroupLeave( groupId, true );
			await bot.client.reloadGroupList();
			res.status( 200 ).send( { code: 200, data: {}, msg: "Success" } );
		} catch ( error: any ) {
			res.status( 500 ).send( { code: 500, data: [], msg: error.message || "Server Error" } );
		}
	} )
	.post( "/exit/batch", async ( req, res ) => {
		const groupIds: number[] = req.body.groupIds;
		if ( !groupIds ) {
			res.status( 400 ).send( { code: 400, data: [], msg: "Error Params" } );
			return;
		}
		
		try {
			let first: boolean = true;
			for ( const id of groupIds ) {
				if ( !first ) {
					await sleep( getRandomNumber( 100, 1000 ) );
				}
				await bot.client.setGroupLeave( id, true );
				first = false;
			}
			await bot.client.reloadGroupList();
			res.status( 200 ).send( { code: 200, data: {}, msg: "Success" } );
		} catch ( error: any ) {
			res.status( 500 ).send( { code: 500, data: [], msg: error.message || "Server Error" } );
		}
	} )

async function getGroupInfo( info: GroupInfo ): Promise<GroupData | undefined> {
	const groupId: number = info.group_id;
	const groupName: string = info.group_name;
	const groupAvatar: string = `http://p.qlogo.cn/gh/${ groupId }/${ groupId }/100/`;
	
	const botGroupInfo = await bot.client.getGroupMemberInfo( groupId, bot.client.uin );
	
	if ( botGroupInfo.retcode !== 0 ) {
		return undefined;
	}
	
	const groupRole = botGroupInfo.data.role;
	
	const isBanned: boolean = await bot.redis.existListElement(
		"adachi.banned-group", groupId
	);
	const groupAuth = isBanned ? 1 : 2;
	
	const interval: number = bot.interval.get( groupId, "group" );
	const limits: string[] = await bot.redis.getList( `adachi.group-command-limit-${ groupId }` );
	
	return { groupId, groupName, groupAvatar, groupAuth, groupRole, interval, limits }
}

/* 向随机间隔1-4s向群聊发送消息，每发送8-12次，下一次间隔改为6-20s */
function sendToGroupMsg( groupId: number, content: string, delay: number, count: number ): number {
	const splitRandom = getRandomNumber( 8, 12 );
	const maxSec = count % splitRandom === 0 ? 20 : 4;
	const minSec = count % splitRandom === 0 ? 6 : 1;
	const randomSeconds: number = Math.floor( ( Math.random() * ( maxSec - minSec ) + minSec ) * 1000 ) + delay;
	setTimeout( async () => {
		await bot.client.sendGroupMsg( groupId, content );
	}, randomSeconds );
	
	return randomSeconds;
}