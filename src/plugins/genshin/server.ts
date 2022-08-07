import { Logger } from "log4js";
import express from "express";
import * as r from "./routes"

export function createServer( port: number, logger: Logger ): void {
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
	
	app.listen( port, () => {
		logger.info( `[genshin]插件的 Express 服务器已启动, 端口为: ${ port }` );
	} );
}