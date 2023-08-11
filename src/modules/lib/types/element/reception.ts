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
		type?: "sticker"; // 是否为超级表情
	}
}

/** 语音 */
export interface RecordRecepElem {
	type: "record";
	data: {
		/** 文件名 & 本地绝对路径 & URL & Base64 */
		file: string;
		/** 文件路径 */
		url: string;
	}
}

/** 短视频 */
export interface VideoRecepElem {
	type: "video";
	data: {
		/** 文件名 & 本地绝对路径 & URL & Base64 */
		file: string;
		url: string;
	}
}

/** @某人 */
export interface AtRecepElem {
	type: "at";
	data: {
		/** @的 QQ 号, all 表示全体成员 */
		qq: string;
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
		content?: string;
		/** 图片 URL */
		image?: string;
	}
}

/** 图片 */
export interface ImageRecepElem {
	type: "image";
	data: {
		/** 文件名 & 本地绝对路径 & URL & Base64 */
		file: string;
		/** 图片 url */
		url: string;
		/** 图片子类型, 只出现在群聊. 0 正常图 1 表情包 ... */
		subType: string;
	}
}

/** 回复 */
export interface ReplayRecepElem {
	type: "reply";
	data: {
		/** 所引用的消息id */
		id: string;
	}
}

/** 红包 */
export interface RedBagRecepElem {
	type: "redbag";
	data: {
		title: string; // 祝福语/口令
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

/** JSON */
export interface JsonRecepElem {
	type: "json";
	data: {
		data: string; // json内容
		resid?: number; // 默认不填为0, 走小程序通道, 填了走富文本通道发送
	}
}

/** 接收到的消息类型 */
export type MessageRecepElem = TextRecepElem | FaceRecepElem | RecordRecepElem | VideoRecepElem | AtRecepElem |
	ShareRecepElem | ImageRecepElem | ReplayRecepElem | RedBagRecepElem | ForwardRecepElem | JsonRecepElem;
