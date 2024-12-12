/** 接收消息类型 */

/** 文本 */
export interface TextRecepElem {
	type: "text";
	data: {
		text: string;
	}
}

/** QQ 表情 */
export interface FaceRecepElem {
	type: "face";
	data: {
		id: string;
	}
}

/** 图片 */
export interface ImageRecepElem {
	type: "image";
	data: {
		/** 文件名 */
		file: string;
		/** 图片 url */
		url: string;
		/** 图片类型，flash 表示闪照，无此参数表示普通图片 */
		type?: "flash";
	}
}

/** 语音 */
export interface RecordRecepElem {
	type: "record";
	data: {
		/** 文件名 */
		file: string;
		/** 文件路径 */
		url: string;
		/** 默认 0，设置为 1 表示变声 */
		magic: string;
	}
}

/** 短视频 */
export interface VideoRecepElem {
	type: "video";
	data: {
		/** 文件名 */
		file: string;
		/** 视频 URL */
		url: string;
	}
}

/** at某人 */
export interface AtRecepElem {
	type: "at";
	data: {
		/** at 的 QQ 号, all 表示全体成员 */
		qq: string;
	}
}

/** 猜拳魔法表情 */
export interface RpsRecepElem {
	type: "rps",
	data: {}
}

/** 掷骰子魔法表情 */
export interface DiceRecepElem {
	type: "dice",
	data: {}
}

/**
 * 窗口抖动（戳一戳）
 * @description 相当于戳一戳最基本类型的快捷方式
 */
export interface ShakeRecepElem {
	type: "shake",
	data: {}
}

/**
 * 戳一戳
 * @description 参数值详见 https://github.com/mamoe/mirai/blob/f5eefae7ecee84d18a66afce3f89b89fe1584b78/mirai-core/src/commonMain/kotlin/net.mamoe.mirai/message/data/HummerMessage.kt#L49
 */
export interface PokeRecepElem {
	type: "poke";
	data: {
		type: string;
		id: string;
		name: string;
	}
}

/** 链接分享 */
export interface ShareRecepElem {
	type: "share";
	data: {
		/** url */
		url: string;
		/** 标题 */
		title: string;
		/** 内容描述 */
		content: string;
		/** 图片 URL */
		image: string;
	}
}

/** 推荐 */
export interface ContactRecepElem {
	type: "contact";
	data: {
		/** 好友/群 */
		type: "qq" | "group";
		/** 被推荐人/群的 QQ 号 */
		id: string;
	}
}

/** 位置 */
export interface LocationRecepElem {
	type: "location";
	data: {
		/** 纬度 */
		lat: string;
		/** 经度 */
		lon: string;
		/** 标题 */
		title: string;
		/** 内容描述 */
		content: string;
	}
}

/** 回复 */
export interface ReplyRecepElem {
	type: "reply";
	data: {
		/** 回复时引用的消息 ID */
		id: string;
	}
}

/** 合并转发 */
export interface ForwardRecepElem {
	type: "forward";
	data: {
		/** 合并转发ID, 需要通过 /get_forward_msg API获取转发的具体内容 */
		id: number;
	}
}

/** XML */
export interface XmlRecepElem {
	type: "xml";
	data: {
		/** XML 内容 */
		data: string;
	}
}

/** JSON */
export interface JsonRecepElem {
	type: "json";
	data: {
		data: string; // json内容
	}
}

/**
 * file
 * 方便对上传的文件处理，并不存在于 ob11 的消息类型中
 **/
export interface FileRecepElem {
	type: "file";
	data: {
		/** 文件名 */
		file: string;
		/** 文件路径 */
		url: string;
		/** 文件大小 */
		size: number;
		/** 部分实现端可能会有 */
		id?: string;
	}
}

/** 接收到的消息类型 */
export type MessageRecepElem = TextRecepElem | FaceRecepElem | RecordRecepElem | VideoRecepElem | AtRecepElem |
	RpsRecepElem | DiceRecepElem | ShakeRecepElem | PokeRecepElem | ShareRecepElem | ContactRecepElem |
	LocationRecepElem | ImageRecepElem | ReplyRecepElem | ForwardRecepElem | XmlRecepElem | JsonRecepElem | FileRecepElem;
