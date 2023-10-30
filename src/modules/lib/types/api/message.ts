import { MessageRecepElem } from "@/modules/lib/types/element/reception";
import { PostMessageGroupSender, PostMessagePrivateSender, PostMessageSender } from "@/modules/lib";

interface GetCommonMessage {
	/** 消息id */
	message_id: number;
	/** 消息真实id */
	real_id: number;
	/** 发送时间 */
	time: number;
	/** 消息内容 */
	message: MessageRecepElem[];
}

/** 获取消息-私聊 */
export interface GetPrivateMessage extends GetCommonMessage {
	message_type: "private";
	/** 发送者 */
	sender: PostMessagePrivateSender;
}

/** 获取消息-群聊 */
export interface GetGroupMessage extends GetCommonMessage {
	message_type: "group";
	/** 发送者 */
	sender: PostMessageGroupSender;
}

/** 获取消息 */
export type GetMessage = GetPrivateMessage | GetGroupMessage;

/** 发送消息 */
export interface SendMessage {
	/** 消息 ID */
	message_id: number;
}

interface ForwardMessageItem {
	type: "node",
	data: {
		user_id: number;
		nickname: string;
		content: string | MessageRecepElem[]
	}
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