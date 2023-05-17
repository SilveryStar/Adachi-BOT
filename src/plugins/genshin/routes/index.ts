import CardRouter from "./card-route";
import ArtifactRouter from "./artifact-route";
import WishRouter from "./wish-route";
import InfoRouter from "./info-route";
import NoteRouter from "./note-route";
import AbyssRouter from "./abyss-route";
import DailyRouter from "./daily-route";
import AlmanacRouter from "./almanac-route";
import CharacterRouter from "./character-route";
import LedgerRouter from "./ledger";

export default {
	"/api/card": CardRouter,
	"/api/artifact": ArtifactRouter,
	"/api/wish": WishRouter,
	"/api/info": InfoRouter,
	"/api/note": NoteRouter,
	"/api/char": CharacterRouter,
	"/api/abyss": AbyssRouter,
	"/api/daily": DailyRouter,
	"/api/almanac": AlmanacRouter,
	"/api/ledger": LedgerRouter,
}