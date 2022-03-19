import { Logger } from "log4js";
import GenshinConfig from "./module/config";
import express from "express";
import * as r from "./routes"

export function createServer( config: GenshinConfig, logger: Logger ): void {
	const app = express();
	app.use( express.static( __dirname ) );
	
	app.use( "/api/card", r.CardRouter );
	app.use( "/api/artifact", r.ArtifactRouter );
	app.use( "/api/wish", r.WishRouter );
	app.use( "/api/info", r.InfoRouter );
	app.use( "/api/note", r.NoteRouter );
	app.use( "/api/char", r.CharacterRouter );
	app.use( "/api/abyss", r.AbyssRouter );
	app.use( "/api/daily", r.DailyRouter );
	app.use( "/api/almanac", r.AlmanacRouter );
	app.use( "/api/ledger", r.LedgerRouter );
	
	app.listen( config.serverPort, () => {
		logger.info( "Express 服务器已启动" );
	} );
}