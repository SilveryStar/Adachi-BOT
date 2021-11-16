import express from "express";
import bot from "ROOT";
import { parseZone } from "moment";

interface DayData {
	dayID: string;
	data: { hour: string, detail: string }[];
}

interface WeekData {
	week: number;
	data: DayData;
}

export default express.Router().get( "/", async ( req, res ) => {
	/* 前端传参为某周周日的日期 */
	const date = new Date( <string>req.query.start );
	const resp: WeekData[] = [];
	for ( let i = 0; i < 7; i++ ) {
		const dayID: string = parseZone( date ).format( "yy/MM/DD" );
		const hours: string[] = await bot.redis.getKeysByPrefix( `adachi.command-stat-${ dayID }` );
		const subData: DayData = { dayID, data: [] };
		
		for ( let hour of hours ) {
			const h: string = <string>hour.split( "/" ).pop();
			const data: string = <string>await bot.redis.getString( hour );
			subData.data.push( { hour: h, detail: data } );
		}
		resp.push( { week: i, data: subData } );
		date.setDate( date.getDate() + 1 );
	}
	res.status( 200 ).send( JSON.stringify( resp ) );
} );