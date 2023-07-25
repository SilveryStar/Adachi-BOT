/** 发送消息类型 */

/** 文本 */
export interface TextElem {
	type: "text";
	text: string;
}

/** QQ 表情 */
export interface FaceElem {
	type: "face";
	id: number;
}

/** 语音 */
export interface RecordElem {
	type: "record";
	/** 文件名 & 本地绝对路径 & URL & Base64 */
	file: string;
	/** 1 变声 */
	magic?: 0 | 1;
	/** 使用 url 发送是时否使用缓存，默认1 */
	cache?: 0 | 1;
	/** 使用 url 发送是时是否使用代理，默认1 */
	proxy?: 0 | 1;
	/** 使用 url 发送是时是否判断超市，默认不超时 */
	timeout?: number;
}

/** 短视频 */
export interface VideoElem {
	type: "video";
	/** 文件名 & 本地绝对路径 & URL & Base64 */
	file: string;
	/** 视频封面, 支持http, file和base64发送, 格式必须为jpg */
	cover?: string;
	/** 通过网络下载视频时的线程数, 默认单线程. */
	c?: 2 | 3;
}

/** @某人 */
export interface AtElem {
	type: "at";
	/** @的 QQ 号, all 表示全体成员 */
	qq: number | "all";
	/** 当在群中找不到此QQ号的名称时才会生效 */
	name?: string;
}

/** 链接分享 */
export interface ShareElem {
	type: "share";
	/** url */
	url: string;
	/** 标题 */
	title: string;
	/** 内容描述 */
	content?: string;
	/** 图片 URL */
	image?: string;
}

/** 音乐分享 */
export interface MusicElem {
	type: "music";
	/** 歌曲 ID */
	id: string;
	/** QQ 音乐、网易云音乐、虾米音乐 */
	platform: "qq" | "163" | "xm";
}

/** 音乐自定义分享 */
export interface MusicCustomElem {
	type: "musicCustom";
	/** 点击后跳转目标 URL */
	url: string;
	/** 音乐 URL */
	audio: string;
	/** 标题 */
	title: string;
	/** 内容描述 */
	content?: string;
	/** 图片 URL */
	image?: string;
}

/** 图片 */
export interface ImageElem {
	type: "image";
	/** 文件名 & 本地绝对路径 & URL & Base64 */
	file: string | Buffer;
	/** 图片子类型, 只出现在群聊. 0 正常图 1 表情包 ... */
	subType?: number;
	/** 使用 url 发送是时否使用缓存，默认 true */
	cache?: 1 | 0;
	c?: 2 | 3; // 通过网络下载视频时的线程数, 默认单线程.
}

export type FlashElem = Omit<ImageElem, "type">  & {
	type: "flash";
}

/** 回复 */
export interface ReplayElem {
	type: "replay";
	/** 所引用的消息id */
	id: number;
}

/** 自定义回复 */
export interface ReplayCustomElem {
	type: "replayCustom";
	/** 自定义回复的信息 */
	text: string;
	/** 自定义回复时的自定义QQ, 如果使用自定义信息必须指定. */
	qq: number;
	/** 自定义回复时的时间, 格式为Unix时间 */
	time: number;
	/** 起始消息序号, 可通过 get_msg 获得 */
	seq: number;
}

/** 戳一戳 */
export interface PokeElem {
	type: "poke";
	/** 需要戳的成员 */
	qq: number;
}

/** 礼物 仅群聊 */
export interface GiftElem {
	type: "gift";
	/** 接收礼物的成员 */
	qq: number;
	/** 礼物的类型 */
	id: number;
}

/** JSON */
export interface JsonElem {
	type: "json";
	/** json内容 */
	data: Record<string, any>;
	/** 默认不填为0, 走小程序通道, 填了走富文本通道发送 */
	resid?: number;
}

export interface ForwardElemNode {
	/** 转发消息id */
	id: number;
}

export interface ForwardElemCustomNode {
	/** 发送者显示名字 */
	name?: string;
	/** 发送者QQ号 */
	uin: number;
	/**	具体消息（不支持转发套娃） */
	content: Sendable;
	/**	具体消息 */
	seq?: Sendable;
}

export interface ForwardElem {
	type: "forward",
	messages: ( ForwardElemNode | ForwardElemCustomNode )[];
};

export type MessageElem = TextElem | FaceElem | RecordElem | VideoElem | AtElem | ShareElem | MusicElem |
	MusicCustomElem | ImageElem | FlashElem | ReplayElem | ReplayCustomElem | PokeElem | GiftElem | JsonElem;

/** 可用来发送的类型集合 */
export type Sendable = string | MessageElem | (string | MessageElem)[];

