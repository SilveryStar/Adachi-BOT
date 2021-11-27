import { Logger } from "log4js";
import { Config } from "#genshin/types";
import express from "express";
import * as r from "./routes"

export function createServer( config: Config, logger: Logger ): void {
	const app = express();
	app.use( express.static( __dirname ) );
	
	app.use( "/api/card", r.CardRouter );
	app.use( "/api/artifact", r.ArtifactRouter );
	app.use( "/api/wish", r.WishRouter );
	app.use( "/api/wish/config", r.TypeRouter );
	app.use( "/api/info", r.InfoRouter );
	
	app.listen( config.serverPort, () => {
		logger.info( "Express 服务器已启动" );
	} );
}