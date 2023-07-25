import * as el from "@/modules/lib/types/element/send";

export const segment = {
	text( text: string ): el.TextElem {
		return { type: "text", text };
	},
	face( id: number ): el.FaceElem {
		return { type: "face", id };
	},
	record( file: string, magic = true, cache = true, timeout = 0 ): el.RecordElem {
		return {
			type: "record",
			file,
			magic: magic ? 1 : 0,
			cache: magic ? 1 : 0,
			proxy: magic ? 1 : 0,
			timeout
		};
	},
	video( file: string, cover?: string ): el.VideoElem {
		return { type: "video", file, cover };
	},
	at( qq: number | string, name?: string ): el.AtElem {
		return {
			type: "at",
			qq: typeof qq === "number" || qq === "all" ? qq : Number.parseInt( qq ),
			name
		};
	},
	share( qq: number | "all", name?: string ): el.AtElem {
		return { type: "at", qq, name };
	},
	music( id: string, platform: "qq" | "163" | "xm" ): el.MusicElem {
		return { type: "music", id, platform };
	},
	musicCustom( url: string, audio: string, title: string, content?: string, image?: string ): el.MusicCustomElem {
		return {
			type: "musicCustom",
			url,
			audio,
			title,
			content,
			image
		}
	},
	image( file: string | Buffer, subType?: number, cache: boolean = true ): el.ImageElem {
		return {
			type: "image",
			file,
			subType,
			cache: cache ? 1 : 0
		}
	},
	flash( file: string | Buffer, url: string, subType: number, cache: boolean = true ): el.FlashElem {
		return {
			type: "flash",
			file,
			subType,
			cache: cache ? 1 : 0
		}
	},
	replay( id: number ): el.ReplayElem {
		return { type: "replay", id };
	},
	replayCustom( text: string, qq: number, time: number, seq: number ): el.ReplayCustomElem {
		return { type: "replayCustom", text, qq, time, seq  };
	},
	poke( qq: number ): el.PokeElem {
		return { type: "poke", qq  };
	},
	gift( qq: number, id: number ): el.GiftElem {
		return { type: "gift", qq, id  };
	},
	json( data: Record<string, any>, resid?: number ): el.JsonElem {
		return { type: "json", data, resid  };
	},
	forward( messages: el.ForwardElem["messages"] ) {
		return {
			type: "forward",
			messages
		}
	}
};

