import { Adachi } from "../../bot";
import { config } from "./init";
import * as r from "./routes"
import express from "express";

function createServer(): void {
	const app = express();
	
	app.use( express.static( __dirname ) );
	app.use( "/api/card", r.CardRouter );
	app.use( "/api/artifact", r.ArtifactRouter );
	app.use( "/api/wish", r.WishRouter );
	app.use( "/api/wish/config", r.TypeRouter );
	app.use( "/api/character", r.CharRouter );
	app.use( "/api/info", r.InfoRouter );
	
	app.listen( config.serverPort, () => {
		Adachi.logger.info( "Express 服务器已启动" )
	} );
}

export { createServer }