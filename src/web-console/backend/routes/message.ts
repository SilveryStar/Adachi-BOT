import bot from "ROOT";
import express from "express";

export interface IMessage {
	user: number;
	content: string;
	date: number;
}

const dbKey = "adachi.call-list";

export default express.Router()
	.get( "/list", async ( req, res ) => {
		const page = parseInt( <string>req.query.page ); // 当前第几页
		const length = parseInt( <string>req.query.length ); // 页长度
		const sort = <"desc" | "asc">( req.query.sort || "desc" ); // 页长度
		const userId = parseInt( <string>req.query.userId ); // 用户
		
		if ( !page || !length ) {
			res.status( 400 ).send( { code: 400, data: {}, msg: "Error Params" } );
			return;
		}
		
		const list: string[] = await bot.redis.getList( dbKey );
		
		const messageList: IMessage[] = list
			.map( d => <IMessage>JSON.parse( d ) )
			.filter( d => userId ? d.user === userId : true )
			.sort( ( prev, next ) => {
				return sort === "desc" ? next.date - prev.date : prev.date - next.date;
			} );
		const resList = messageList.slice( ( page - 1 ) * length, page * length );
		res.status( 200 ).send( { code: 200, data: resList, total: messageList.length } );
	} )
	.post( "/send", async ( req, res ) => {
		const user = parseInt( <string>req.body.user );
		const content = <string>req.body.content;
		const date = parseInt( <string>req.body.date );
		const message: string = <string>req.body.message;
		
		if ( !user || !content || !date || !message ) {
			res.status( 400 ).send( { code: 400, data: {}, msg: "Error Params" } );
			return;
		}
		const delData: IMessage = { user, content, date };
		await bot.redis.delListElement( dbKey, JSON.stringify( delData ) );
		
		await bot.client.sendPrivateMsg( user, `BOT持有者回复：${ message }` );
		
		res.status( 200 ).send( { code: 200, data: delData, msg: "Success" } );
	} )
	.delete( "/remove", async ( req, res ) => {
		const user = parseInt( <string>req.query.user );
		const content = <string>req.query.content;
		const date = parseInt( <string>req.query.date );
		
		if ( !user || !content || !date ) {
			res.status( 400 ).send( { code: 400, data: {}, msg: "Error Params" } );
			return;
		}
		const delData: IMessage = { user, content, date };
		await bot.redis.delListElement( dbKey, JSON.stringify( delData ) );
		
		res.status( 200 ).send( { code: 200, data: delData, msg: "Success" } );
	} )