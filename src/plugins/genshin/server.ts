import { Adachi } from "../../bot";
import { config } from "./init";
import CardRouter from "./routes/card-route";
import ArtifactRouter from "./routes/artifact-route";
import WishRouter from "./routes/wish-route";
import TypeRouter from "./routes/type-route";
import CharRouter from "./routes/character-route";
import InfoRouter from "./routes/info-route";
import AbyssRouter from "./routes/abyss-route";
import express from "express";

function createServer(): void {
	const app = express();
	
	app.use( express.static( __dirname ) );
	app.use( "/api/card", CardRouter );
	app.use( "/api/artifact", ArtifactRouter );
	app.use( "/api/wish", WishRouter );
	app.use( "/api/wish/config", TypeRouter );
	app.use( "/api/character", CharRouter );
	app.use( "/api/info", InfoRouter );
	app.use( "/api/abyss", AbyssRouter );
	
	app.listen( config.serverPort, () => {
		Adachi.logger.info( "Express 服务器已启动" )
	} );
}

export { createServer }