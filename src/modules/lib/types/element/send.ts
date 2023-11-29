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

interface CommonFileElem {
	/** 只在通过网络 URL 发送时有效，表示是否使用已缓存的文件，默认 1 */
	cache?: 1 | 0;
	/** 只在通过网络 URL 发送时有效，表示是否通过代理下载文件（需通过环境变量或配置文件配置代理），默认 1 */
	proxy?: 1 | 0;
	/** 只在通过网络 URL 发送时有效，单位秒，表示下载网络文件的超时时间，默认不超时 */
	timeout?: number;
}

/** 图片 */
export interface ImageElem extends CommonFileElem {
	type: "image";
	/** 文件名 & 本地绝对路径 & URL & Base64 */
	file: string | Buffer;
	/** 图片类型，flash 表示闪照，无此参数表示普通图片 */
	dataType?: "flash";
}

/** 语音 */
export interface RecordElem extends CommonFileElem {
	type: "record";
	/** 文件名 & 本地绝对路径 & URL & Base64 */
	file: string | Buffer;
	/** 默认 0，设置为 1 表示变声 */
	magic?: 0 | 1;
}

/** 短视频 */
export interface VideoElem extends CommonFileElem {
	type: "video";
	/** 文件名 & 本地绝对路径 & URL & Base64 */
	file: string | Buffer;
}

/** at 某人 */
export interface AtElem {
	type: "at";
	/** at 的 QQ 号, all 表示全体成员 */
	qq: number | "all";
}

/** 猜拳魔法表情 */
export interface RpsElem {
	type: "rps",
}

/** 掷骰子魔法表情 */
export interface DiceElem {
	type: "dice",
}

/**
 * 窗口抖动（戳一戳）
 * @description 相当于戳一戳最基本类型的快捷方式
 */
export interface ShakeElem {
	type: "shake"
}

/**
 * 戳一戳
 * @description 参数值详见 https://github.com/mamoe/mirai/blob/f5eefae7ecee84d18a66afce3f89b89fe1584b78/mirai-core/src/commonMain/kotlin/net.mamoe.mirai/message/data/HummerMessage.kt#L49
 */
export interface PokeElem {
	type: "poke";
	dataType: string;
	id: string;
}

/** 匿名发消息 */
export interface AnonymousElem {
	"type": "anonymous",
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

/** 推荐 */
export interface ContactElem {
	type: "contact";
	/** 好友/群 */
	dataType: "qq" | "group";
	/** 被推荐人/群的 QQ 号 */
	id: string;
}

/** 位置 */
export interface LocationElem {
	type: "location";
	/** 纬度 */
	lat: string;
	/** 经度 */
	lon: string;
	/** 标题 */
	title: string;
	/** 内容描述 */
	content: string;
}

/** 音乐分享 */
export interface MusicElem {
	type: "music";
	/** QQ 音乐、网易云音乐、虾米音乐 */
	dataType: "qq" | "163" | "xm";
	/** 歌曲 ID */
	id: string;
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

/** 回复 */
export interface ReplayElem {
	type: "reply";
	/** 所引用的消息id */
	id: number;
}

export interface ForwardElemNode {
	/** 转发消息id */
	id: number;
}

export interface ForwardElemCustomNode {
	/** 发送者显示名字 */
	nickname?: string;
	/** 发送者QQ号 */
	user_id: number;
	/**	具体消息（不支持转发套娃） */
	content: Sendable;
}

/** XML */
export interface XmlElem {
	type: "xml";
	/** XML 内容 */
	data: string;
}

/** JSON */
export interface JsonElem {
	type: "json";
	/** json内容 */
	data: Record<string, any>;
}

export interface ForwardElem {
	type: "forward",
	messages: ( ForwardElemNode | ForwardElemCustomNode )[];
};

export type MessageElem = TextElem | FaceElem | ImageElem | RecordElem | VideoElem | AtElem | RpsElem | DiceElem |
	ShakeElem | PokeElem | AnonymousElem | ShareElem | ContactElem | LocationElem | MusicElem | MusicCustomElem |
	ReplayElem | XmlElem | JsonElem;

/** 可用来发送的类型集合 */
export type Sendable = string | MessageElem | (string | MessageElem)[];

