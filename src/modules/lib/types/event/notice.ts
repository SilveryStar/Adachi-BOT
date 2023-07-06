import { CommonEvent } from "./common";
import { HonorType, PostNoticeType } from "../common";

/** 通知 */
export type NoticeEvent = NoticePrivateEvent | NoticeGroupEvent | ClientStatusNoticeEvent;

/** 私聊通知 */
export type NoticePrivateEvent = PrivateRecallNoticeEvent | FriendAddNoticeEvent | FriendPokeNoticeEvent |
	FriendOfflineFileNoticeEvent;

/** 群通知 */
export type NoticeGroupEvent = GroupRecallNoticeEvent | GroupIncreaseNoticeEvent |GroupDecreaseNoticeEvent |
	GroupAdminNoticeEvent | GroupUploadNoticeEvent | GroupBanNoticeEvent | GroupPokeNoticeEvent |
	GroupLuckKingNoticeEvent | GroupHonorNoticeEvent | GroupEssenceNoticeEvent;

/** 通用通知 */
interface CommonNoticeEvent extends CommonEvent {
	/** 事件类型 */
	post_type: "notice";
	/** 通知类型 */
	notice_type: PostNoticeType;
}

export interface PrivateRecallNoticeEvent extends CommonNoticeEvent {
	/** 通知类型 */
	notice_type: "friend_recall";
	/** 好友 QQ */
	user_id: number;
	/** 被撤回的消息 ID */
	message_id: number;
}

/** 群消息撤回 */
export interface GroupRecallNoticeEvent extends CommonNoticeEvent {
	/** 通知类型 */
	notice_type: "group_recall";
	/** 群号 */
	group_id: number;
	/** 消息发送者 QQ */
	user_id: number;
	/** 操作者 QQ */
	operator_id: number;
	/** 被撤回的消息 ID */
	message_id: number;
}

/** 群成员增加 */
export interface GroupIncreaseNoticeEvent extends CommonNoticeEvent {
	/** 通知类型 */
	notice_type: "group_increase";
	/** 事件子类型 approve:管理员同意 invite:管理员邀请（疑似无效） */
	sub_type: "approve" | "invite";
	/** 群号 */
	group_id: number;
	/** 操作者 QQ */
	operator_id: number;
	/** 加入者 QQ */
	user_id: number;
}

/** 群成员减少 */
export interface GroupDecreaseNoticeEvent extends CommonNoticeEvent {
	/** 通知类型 */
	notice_type: "group_decrease";
	/** 事件子类型 leave:主动退群 kick:成员被踢 kick_me:bot被踢 */
	sub_type: "leave" | "kick" | "kick_me";
	/** 群号 */
	group_id: number;
	/** 操作者 QQ */
	operator_id: number;
	/** 离开者 QQ */
	user_id: number;
}

/** 群管理员变动 */
export interface GroupAdminNoticeEvent extends CommonNoticeEvent {
	/** 通知类型 */
	notice_type: "group_admin";
	/** 事件子类型 set:设置管理员 unset:取消设置管理员 */
	sub_type: "set" | "unset";
	/** 群号 */
	group_id: number;
	/** 管理员 QQ */
	user_id: number;
}

/** 群文件上传 */
export interface GroupUploadNoticeEvent extends CommonNoticeEvent {
	/** 通知类型 */
	notice_type: "group_upload";
	/** 群号 */
	group_id: number;
	/** 发送者 QQ */
	user_id: number;
	/** 文件信息 */
	file: {
		/** 文件 ID */
		id: string;
		/** 文件名 */
		name: string;
		/** 文件大小 ( 字节数 ) */
		size: number;
		/** 未知 */
		busid: number;
		/** 文件 url */
		url: string;
	}
}

/** 群禁言 */
export interface GroupBanNoticeEvent extends CommonNoticeEvent {
	/** 通知类型 */
	notice_type: "group_ban";
	/** 事件子类型 ban:禁言 lift_ban:解除禁言 */
	sub_type: "ban" | "lift_ban";
	/** 群号 */
	group_id: number;
	/** 操作者 QQ */
	operator_id: number;
	/** 被禁言 QQ (为全员禁言时为 0 ) */
	user_id: number;
	/** 禁言时长, 单位秒 */
	duration: number;
}

/** 好友添加 */
export interface FriendAddNoticeEvent extends CommonNoticeEvent {
	/** 通知类型 */
	notice_type: "friend_add";
	/** 新添加好友 QQ */
	user_id: number;
}

/** 好友戳一戳 */
export interface FriendPokeNoticeEvent extends CommonNoticeEvent {
	/** 通知类型 */
	notice_type: "notify";
	/** 提示类型 */
	sub_type: "poke";
	/** 发送者 QQ */
	sender_id: number;
	/** 发送者 QQ */
	user_id: number;
	/** 被戳者 QQ */
	target_id: number;
}

/** 群内戳一戳（此事件无法在手表协议上触发） */
export interface GroupPokeNoticeEvent extends FriendPokeNoticeEvent {
	/** 群号 */
	group_id: number;
}

/** 群红包运气王（此事件无法在手表协议上触发） */
export interface GroupLuckKingNoticeEvent extends CommonNoticeEvent {
	/** 通知类型 */
	notice_type: "notify";
	/** 提示类型 */
	sub_type: "lucky_king";
	/** 群号 */
	group_id: number;
	/** 红包发送者 QQ */
	user_id: number;
	/** 运气王 QQ */
	target_id: number;
}

/** 群成员荣誉变更（此事件无法在手表协议上触发） */
export interface GroupHonorNoticeEvent extends CommonNoticeEvent {
	/** 通知类型 */
	notice_type: "notify";
	/** 提示类型 */
	sub_type: "honor";
	/** 群号 */
	group_id: number;
	/** 成员 QQ */
	user_id: number;
	/** 荣誉类型 talkative:龙王 performer:群聊之火 emotion:快乐源泉 */
	honor_type: HonorType;
}

/** 接收到离线文件 */
export interface FriendOfflineFileNoticeEvent extends CommonNoticeEvent {
	/** 通知类型 */
	notice_type: "notify";
	/** 提示类型 */
	sub_type: "offline_file";
	/** 发送者 QQ */
	user_id: number;
	/** 文件信息 */
	file: {
		/** 文件名 */
		name: string;
		/** 文件大小 ( 字节数 ) */
		size: number;
		/** 文件下载链接 */
		url: string;
	};
}

/** 精华消息变更 */
export interface GroupEssenceNoticeEvent extends CommonNoticeEvent {
	/** 通知类型 */
	notice_type: "essence";
	/** 提示类型 add:添加 delete:移除 */
	sub_type: "add" | "delete";
	/** 群号 */
	group_id: number;
	/** 群号 */
	sender_id: number;
	/** 操作者 QQ */
	operator_id: number;
	/** 消息ID */
	message_id: number;
}

/** 客户端状态变更 */
export interface ClientStatusNoticeEvent extends CommonNoticeEvent {
	/** 通知类型 */
	notice_type: "client_status";
	time: number;
	self_id: number;
	online: number;
	client: {
		app_id: number;
		device_kind: number;
		device_name: number;
	};
}