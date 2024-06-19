/**
 * 请求 api 需要传递的参数格式
 */

import { ForwardElemCustomNode, ForwardElemNode } from "@/modules/lib/types/element/send";
import { Anonymous, HonorType, RecordFormat } from "@/modules/lib/types/common";


/** 操作消息 */
export interface OperateMessageParam {
	/** 消息id */
	message_id: number;
}

/** 操作合并转发消息 */
export interface OperateForwardMessageParam {
	/** 合并转发id */
	id: string;
}

/** 操作用户 */
export interface OperateUserParam {
	/** 用户 QQ */
	user_id: number;
}

/** 操作群聊 */
export interface OperateGroupParam {
	/** 群号 */
	group_id: number;
}

/** 设置登录号资料 */
export interface SetQqProfileParam {
	/** 名称 */
	nickname?: string;
	/** 公司 */
	company?: string;
	/** 邮箱 */
	email?: string;
	/** 学校 */
	college?: string;
	/** 个人说明 */
	personal_note?: string;
}

/** 发送好友赞 */
export interface SendLikeParam extends OperateUserParam {
	/** 赞的次数，每个好友每天最多 10 次 */
	time: number;
}

/** 缓存参数 */
export interface NoCacheParam {
	/** 是否不使用缓存（使用缓存可能更新不及时, 但响应更快）, 默认 false */
	no_cache?: boolean;
}

/** 获取陌生人信息 */
export interface GetStrangerInfoParam extends NoCacheParam, OperateUserParam {}

/**
 * 发送消息
 * @message 要发送的内容
 * @auto_escape 消息内容是否作为纯文本发送(即不解析 CQ 码), 只在 message 字段是字符串时有效, 默认 false
 */
interface CommonSendMsg {
	/** 要发送的内容 */
	message: any[];
	/** 消息内容是否作为纯文本发送(即不解析 CQ 码), 只在 message 字段是字符串时有效, 默认 false */
	auto_escape?: boolean;
}

/** 发送私聊消息 */
export interface SendPrivateMsgParam extends CommonSendMsg, OperateUserParam {}

/** 发送群聊消息 */
export interface SendGroupMsgParam extends CommonSendMsg, OperateGroupParam {}

interface SendMsgPrivate extends CommonSendMsg, OperateUserParam {
	message_type: "private";
}

interface SendMsgGroup extends CommonSendMsg, OperateGroupParam {
	message_type: "group";
}

/** 发送消息 */
export type SendMsgParam = SendMsgPrivate | SendMsgGroup;

export interface ForwardElemParam {
	type: "node";
	data: ForwardElemNode | ForwardElemCustomNode;
}

/** 发送合并转发 ( 群聊 ) */
export interface SendGroupForwardMsgParam extends OperateGroupParam {
	/** 自定义转发消息 */
	messages: ForwardElemParam[];
}

/** 发送合并转发 ( 私聊 ) */
export interface SendPrivateForwardMsgParam extends OperateUserParam {
	/** 自定义转发消息 */
	messages: ForwardElemParam[];
}

/** 获取群消息历史记录 */
export interface GetGroupMsgHistoryParam extends OperateGroupParam {
	/** 起始消息序号, 可通过 get_msg 获得 */
	message_seq: number;
}

/** 获取图片信息 */
export interface GetImageParam {
	/** 图片缓存文件名 */
	file: string;
}

/** 重启 OneBot 实现 */
export interface RestartParam {
	/** 要延迟的毫秒数，如果默认情况下无法重启，可以尝试设置延迟为 2000 左右 */
	delay: number;
}

/** 获取语音 */
export interface GetRecordParam {
	/** 收到的语音文件名（消息段的 file 参数）, 如 0B38145AA44505000B38145AA4450500.silk */
	file: string;
	/** 要转换到的格式 */
	out_format: RecordFormat;
}

/** 处理加好友请求 */
export interface SetFriendAddRequestParam {
	/** 请求的 flag（需从上报的数据中获得） */
	flag: string;
	/** 是否同意请求, 默认 true */
	approve?: boolean;
	/** 添加后的好友备注（仅在同意时有效） */
	remark?: string;
}

interface SetGroupAddRequestParamOne extends SetFriendAddRequestParam {
	/** 请求类型（需要和上报消息中的 sub_type 字段相符） */
	sub_type: string;
}

interface SetGroupAddRequestParamOther extends SetFriendAddRequestParam {
	/** 请求类型（需要和上报消息中的 sub_type 字段相符） */
	type: string;
}
/** 处理群请求 */
export type SetGroupAddRequestParam = SetGroupAddRequestParamOne | SetGroupAddRequestParamOther;

/** 处理群请求 */
export interface GetGroupInfoParam extends NoCacheParam, OperateGroupParam {}

/** 获取群成员信息 */
export interface GetGroupMemberInfoParam extends GetGroupInfoParam, OperateUserParam {}

/** 获取群荣誉信息 */
export interface GetGroupHonorInfoParam extends OperateGroupParam {
	/** 要获取的群荣誉类型,传入 all 获取所有数据 */
	type: HonorType | "all";
}

/** 设置群名 */
export interface SetGroupNameParam extends OperateGroupParam {
	/** 新群名 */
	group_name: string;
}

/** 获取群荣誉信息 */
export interface GetCookiesParam {
	/** 需要获取 cookies 的域名 */
	domain: string;
}

/** 设置群管理员 */
export interface SetGroupAdminParam extends OperateGroupParam, OperateUserParam {
	/** true 为设置, false 为取消, 默认 true */
	enable?: boolean;
}

/** 设置群名片 ( 群备注 ) */
export interface SetGroupCardParam extends OperateGroupParam, OperateUserParam {
	/** 群名片内容, 不填或空字符串表示删除群名片 */
	card?: string;
}

/** 设置群组专属头衔 */
export interface SetGroupSpecialTitleParam extends OperateGroupParam, OperateUserParam {
	/** 专属头衔, 不填或空字符串表示删除专属头衔 */
	special_title?: string;
	/** 专属头衔有效期, 单位秒, -1 表示永久, 不过此项似乎没有效果, 可能是只有某些特殊的时间长度有效, 有待测试, 默认 -1 */
	duration?: number;
}

/** 群单人禁言 */
export interface SetGroupBanParam extends OperateGroupParam, OperateUserParam {
	/** 禁言时长, 单位秒, 0 表示取消禁, 默认 30 * 60 */
	duration?: number;
}

/** 群全员禁言 */
export interface SetGroupWholeBanParam extends OperateGroupParam {
	/** 是否禁言, 默认 true */
	enable?: boolean;
}

/**
 * 群匿名用户禁言
 * @desc anonymous 与 flag 两者取其一即可, 都传入时使用 anonymous
 */
export interface SetGroupAnonymousBanParam extends OperateGroupParam {
	/** 要禁言的匿名用户对象（群消息上报的 anonymous 字段） */
	anonymous?: Anonymous;
	/** 要禁言的匿名用户的 flag（需从群消息上报的数据中获得） */
	flag?: string;
	/** 与 flag 作用完全相同，取其一即可 */
	anonymous_flag?: string;
	/** 禁言时长, 单位秒, 0 表示取消禁, 默认 30 * 60 */
	duration?: number;
}


/** 群设置匿名 */
export interface SetGroupAnonymousParam extends OperateGroupParam {
	/** 是否允许匿名聊天, 默认 true */
	enable?: boolean;
}

/** 群组踢人 */
export interface SetGroupKickParam extends OperateGroupParam, OperateUserParam {
	/** 拒绝此人的加群请求, 默认 false */
	reject_add_request?: boolean;
}

/** 退出群组 */
export interface SetGroupLeaveParam extends OperateGroupParam {
	/** 是否解散, 如果登录号是群主, 则仅在此项为 true 时能够解散, 默认 false */
	is_dismiss?: boolean;
}

/**
 * 上传群文件
 * @desc 只能上传本地文件, 需要上传 http 文件的话请先调用 download_file API下载
 */
export interface UploadGroupFileParam extends OperateGroupParam {
	/** 本地文件路径 */
	file: string;
	/** 储存名称 */
	name: string;
	/** 父目录ID，不提供时默认上传到根目录 */
	folder?: string;
}

/**
 * 上传私聊文件
 * @desc 只能上传本地文件, 需要上传 http 文件的话请先调用 download_file API下载
 */
export interface UploadPrivateFileParam extends OperateUserParam {
	/** 文件名称 */
	name: string;
	/** 本地文件路径 */
	file: string;
}