import * as el from "@/modules/lib/types/element/send";

export interface SegmentFileOption {
	cache?: boolean;
	proxy?: boolean;
	timeout?: number;
}

export interface SegmentRecordOption extends SegmentFileOption {
	magic?: boolean;
}

export const segment = {
	text( text: string ): el.TextElem {
		return { type: "text", text };
	},
	face( id: number ): el.FaceElem {
		return { type: "face", id };
	},
	image( file: string | Buffer, option: SegmentFileOption = {} ): el.ImageElem {
		const { cache = true, proxy = true, timeout } = option;
		const data: el.ImageElem = {
			type: "image",
			file,
			cache: cache ? 1 : 0,
			proxy: proxy ? 1 : 0
		};
		if ( timeout ) {
			data.timeout = timeout;
		}
		return data;
	},
	flash( file: string | Buffer, option: SegmentFileOption = {} ): el.ImageElem {
		const { cache = true, proxy = true, timeout } = option;
		const data: el.ImageElem = {
			type: "image",
			file,
			dataType: "flash",
			cache: cache ? 1 : 0,
			proxy: proxy ? 1 : 0
		};
		if ( timeout ) {
			data.timeout = timeout;
		}
		return data;
	},
	record( file: string | Buffer, option: SegmentRecordOption = {} ): el.RecordElem {
		const { magic = false, cache = true, proxy = true, timeout } = option;
		const data: el.RecordElem = {
			type: "record",
			file,
			magic: magic ? 1 : 0,
			cache: cache ? 1 : 0,
			proxy: proxy ? 1 : 0
		};
		if ( timeout ) {
			data.timeout = timeout;
		}
		return data;
	},
	video( file: string, option: SegmentFileOption = {} ): el.VideoElem {
		const { cache = true, proxy = true, timeout } = option;
		const data: el.VideoElem = {
			type: "video",
			file,
			cache: cache ? 1 : 0,
			proxy: proxy ? 1 : 0
		};
		if ( timeout ) {
			data.timeout = timeout;
		}
		return data;
	},
	at( qq: number | string ): el.AtElem {
		return {
			type: "at",
			qq: typeof qq === "number" || qq === "all" ? qq : Number.parseInt( qq )
		};
	},
	rps(): el.RpsElem {
		return { type: "rps" };
	},
	dice(): el.DiceElem {
		return { type: "dice" };
	},
	shake(): el.ShakeElem {
		return { type: "shake" };
	},
	poke( type: string, id: string ): el.PokeElem {
		return {
			type: "poke",
			dataType: type,
			id
		};
	},
	anonymous(): el.AnonymousElem {
		return { type: "anonymous" };
	},
	share( url: string, title: string, content?: string, image?: string ): el.ShareElem {
		return { type: "share", url, title, content, image };
	},
	contact( type: "qq" | "group", id: string ): el.ContactElem {
		return { type: "contact", dataType: type, id };
	},
	location( type: "qq" | "group", lat: string, lon: string, title: string, content: string ): el.LocationElem {
		return { type: "location", lat, lon, title, content };
	},
	music( id: string, platform: "qq" | "163" | "xm" ): el.MusicElem {
		return { type: "music", id, dataType: platform };
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
	reply( id: number ): el.ReplayElem {
		return { type: "reply", id };
	},
	xml( data: string ): el.XmlElem {
		return { type: "xml", data };
	},
	json( data: Record<string, any> ): el.JsonElem {
		return { type: "json", data  };
	}
};

