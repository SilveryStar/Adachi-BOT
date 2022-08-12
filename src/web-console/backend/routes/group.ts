import bot from "ROOT";
import express from "express";
import { AuthLevel } from "@modules/management/auth";
import { GroupInfo, GroupRole } from "oicq";
import { scheduleJob } from "node-schedule";

type GroupData = {
	groupId: number;
	groupAvatar: string;
	groupName: string;
	groupAuth: AuthLevel;
	groupRole: GroupRole;
	interval: number;
	limits: string[];
}

export default express.Router()
	.get( "/list", async ( req, res ) => {
		const page = parseInt( <string>req.query.page ); // 当前第几页
		const length = parseInt( <string>req.query.length ); // 页长度
		
		if ( !page || !length ) {
			res.status( 400 ).send( { code: 400, data: {}, msg: "Error Params" } );
			return;
		}
		
		const groupId = <string>req.query.groupId || "";
		
		try {
			const glMap = bot.client.gl;
			
			const groupData = Array.from( glMap )
				// 过滤条件：id
				.filter( ( [ key ] ) => {
					return groupId ? key === parseInt( groupId ) : true;
				} )
				// 按入群时间排序
				.sort( ( [ _, { last_join_time: prevTime } ], [ __, { last_join_time: nextTime } ] ) => {
					return nextTime - prevTime;
				} )
				.slice( ( page - 1 ) * length, page * length )
			
			const groupInfos: GroupData[] = [];
			
			for ( const [ _, info ] of groupData ) {
				groupInfos.push( await getGroupInfo( info ) );
			}
			
			const cmdKeys: string[] = bot.command.cmdKeys;
			res.status( 200 ).send( { code: 200, data: { groupInfos, cmdKeys }, total: glMap.size } );
		} catch ( error ) {
			res.status( 500 ).send( { code: 500, data: {}, msg: "Server Error" } );
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
		
		const groupInfo = await getGroupInfo( groupData );
		
		res.status( 200 ).send( { code: 200, data: groupInfo } );
	} )
	.post( "/set", async ( req, res ) => {
		const groupId: number = parseInt( <string>req.body.target );
		const int: number = parseInt( <string>req.body.int );
		const auth = <1 | 2>parseInt( <string>req.body.auth );
		const limits: string[] = JSON.parse( <string>req.body.limits );
		
		/* 封禁相关 */
		const banDbKey = "adachi.banned-group";
		if ( auth === 1 ) {
			await bot.redis.addListElement( banDbKey, groupId );
		} else {
			await bot.redis.delListElement( banDbKey, groupId );
		}
		
		await bot.interval.set( groupId, "private", int );
		
		const dbKey: string = `adachi.group-command-limit-${ groupId }`;
		await bot.redis.deleteKey( dbKey );
		if ( limits.length !== 0 ) {
			await bot.redis.addListElement( dbKey, ...limits );
		}
		
		res.status( 200 ).send( "success" );
	} )
	.post( "/batchsend", async ( req, res ) => {
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
		
		if ( groupIds && groupIds.length !== 0 ) {
			groupIds.forEach( groupId => {
				sendToGroupMsg( groupId, content );
			} )
		} else {
			const groupList = bot.client.gl;
			groupList.forEach( ( _, groupId ) => {
				sendToGroupMsg( groupId, content );
			} )
		}
		const cdTime = new Date().getTime() + 3 * 60 * 1000;
		await bot.redis.setString( timoutDbKey, cdTime );
		res.status( 200 ).send( { code: 200, data: { cdTime }, msg: "Success" } );
	} )
	.delete( "/exit", async ( req, res ) => {
		const groupId = parseInt( <string>req.query.groupId );
		
		try {
			if ( !groupId ) {
				res.status( 400 ).send( { code: 400, data: [], msg: "Error Params" } );
				return;
			}
			await bot.client.setGroupLeave( groupId );
			await bot.client.reloadGroupList();
			res.status( 200 ).send( { code: 200, data: {}, msg: "Success" } );
		} catch ( error ) {
			res.status( 500 ).send( { code: 500, data: [], msg: "Server Error" } );
		}
	} )

async function getGroupInfo( info: GroupInfo ): Promise<GroupData> {
	const groupId = info.group_id;
	const groupName = info.group_name;
	const groupAvatar = `http://p.qlogo.cn/gh/${ groupId }/${ groupId }/100/`;
	
	const botGroupInfo = await bot.client.getGroupMemberInfo( groupId, bot.config.number );
	const groupRole = botGroupInfo.data!.role;
	
	const isBanned: boolean = await bot.redis.existListElement(
		"adachi.banned-group", groupId
	);
	const groupAuth = isBanned ? 1 : 2;
	
	const interval: number = bot.interval.get( groupId, -1 );
	const limits: string[] = await bot.redis.getList( `adachi.group-command-limit-${ groupId }` );
	
	return { groupId, groupName, groupAvatar, groupAuth, groupRole, interval, limits }
}

/* 向群聊发送消息 */
function sendToGroupMsg( groupId: number, content: string ) {
	const date = new Date();
	const randomSeconds: number = Math.floor( Math.random() * 300 );
	date.setSeconds( date.getSeconds() + randomSeconds );
	
	scheduleJob( date, async () => {
		await bot.client.sendGroupMsg( groupId, content );
	} );
}