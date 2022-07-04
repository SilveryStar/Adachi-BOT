import { Logger } from "log4js";
import express from "express";
import bot from "ROOT";

const HelpRoute = express.Router().get( "/", async ( req, res ) => {
	const data = await bot.redis.getString( "adachi.help-data" );
	res.send( JSON.parse( data ) );
} )

export function createServer( port: number, logger: Logger ): void {
	const app = express();
	app.use( express.static( __dirname ) );
	
	app.use( "/api/help", HelpRoute );
	
	app.listen( port, () => {
		logger.info( "@help Express服务已启动" );
	} );
}