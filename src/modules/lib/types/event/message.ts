import { CommonEvent } from "./common";
import {
	Anonymous,
	PostMessageGroupSender,
	PostMessagePrivateSender,
	PostMessageSender,
	PostMessageSubType,
	PostMessageType
} from "../common";
import { MessageRecepElem } from "@/modules/lib/types/element/reception";
import { Sendable } from "@/modules/lib";

/** 消息 */
export type MessageEvent = PrivateFriendMessageEvent | PrivateGroupMessageEvent |
	GroupNormalMessageEvent | GroupAnonymousMessageEvent;

/** 通用消息 */
interface CommonMessageEvent extends CommonEvent {
	/** 事件类型 */
	post_type: "message" | "message_sent";
	/** 消息类型 */
	message_type: PostMessageType;
	/** 子类型 */
	sub_type: PostMessageSubType;
	/** 消息 ID */
	message_id: number;
	/** 发送者 QQ */
	user_id: number;
	/** 一个消息链 */
	message: MessageRecepElem[];
	/** CQ 码格式的消息 */
	raw_message: string;
	/** 字体 */
	font: number;
	/** 发送者信息 */
	sender: PostMessageSender;
	/** 是否为 at bot */
	atMe: boolean;
	/**
	 * 快捷回复该消息
	 * @param content 回复内容
	 */
	reply( content: Sendable ): void;
}

/** 私聊消息 */
export interface PrivateMessageEvent extends CommonMessageEvent {
	/** 消息类型 */
	message_type: "private";
	/** 消息子类型  friend:好友 group:群临时会话 */
	sub_type: "friend" | "group";
	/** 发送人信息 */
	sender: PostMessagePrivateSender;
	/** 接收者 QQ */
	target_id: number;
	/** 临时会话来源 */
	temp_source: number;
}

/** 好友私聊消息 */
export interface PrivateFriendMessageEvent extends PrivateMessageEvent {
	/** 消息子类型 */
	sub_type: "friend";
	/** 发送人信息 */
	sender: Omit<PostMessagePrivateSender, "group_id">;
}

/** 群临时会话私聊消息 */
export interface PrivateGroupMessageEvent extends PrivateMessageEvent {
	/** 消息子类型 */
	sub_type: "group";
	/** 发送人信息 */
	sender: PostMessagePrivateSender & { group_id: number };
}

/** 群消息 */
export interface GroupMessageEvent extends CommonMessageEvent {
	/** 消息类型 */
	message_type: "group";
	/** 消息子类型  normal:正常 anonymous:匿名消息是 */
	sub_type: "normal" | "anonymous";
	/** 发送人信息 */
	sender: PostMessageGroupSender;
	/** 群号 */
	group_id: number;
	/** 匿名信息, 如果不是匿名消息则为 null */
	anonymous: Anonymous | null;
	/** 快捷撤回该消息 */
	recall(): void;
	/** 快捷踢出该消息发送者 */
	kick(): void;
	/** 快捷禁言该用户，默认 30分钟 */
	ban( duration?: number ): void;
}

/** 群正常消息 */
export interface GroupNormalMessageEvent extends GroupMessageEvent {
	/** 消息子类型 */
	sub_type: "normal";
	/** 不是匿名消息，恒定 null */
	anonymous: null;
}

/** 群匿名消息 */
export interface GroupAnonymousMessageEvent extends GroupMessageEvent {
	/** 消息子类型 */
	sub_type: "anonymous";
	/** 匿名消息 */
	anonymous: Anonymous;
}