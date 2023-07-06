import { MessageRecepElem } from "@/modules/lib/types/element/reception";

/** 获取消息 */
export interface GetMessage {
	/** 消息id */
	message_id: number;
	/** 消息真实id */
	real_id: number;
	/** 群消息时为group, 私聊消息为private */
	message_type: "group" | "private";
	/** 发送者 */
	sender: {
		user_id: number;
		nickname: string;
	}
	/** 是否是群消息 */
	group: boolean;
	/** 是群消息时的群号(否则不存在此字段) */
	group_id?: number;
	/** 发送时间 */
	time: number;
	/** 消息内容 */
	message: MessageRecepElem[];
	/** 原始消息内容 */
	raw_message: string;
}

/** 发送消息 */
export interface SendMessage {
	/** 消息 ID */
	message_id: number;
}

interface ForwardMessageItem {
	content: string;
	sender: {
		user_id: number;
		nickname: string;
	};
	time: number;
}

/** 合并转发内容 */
export interface ForwardMessage {
	/** 消息列表 */
	messages: ForwardMessageItem[];
}

/** 发送合并转发响应 */
export interface SendForwardMessage {
	/** 消息 ID */
	message_id: number;
	/** 转发消息 ID */
	forward_id: string;
}

/** 群消息历史记录 */
export interface GroupMsgHistory {
	/** 从起始序号开始的前19条消息 */
	messages: MessageRecepElem[];
}