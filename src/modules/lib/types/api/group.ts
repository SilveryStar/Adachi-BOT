import { PostMessageGroupSender } from "@/modules/lib/types/common";

/** 群信息 */
export interface GroupInfo {
	/** 群号 */
	group_id: number;
	/** 群名称 */
	group_name: string;
	/** 群备注 */
	group_memo: string;
	/** 群创建时间 */
	group_create_time: number;
	/** 群等级 */
	group_level: number;
	/** 成员数 */
	member_count: number;
	/** 最大成员数（群容量） */
	max_member_count: number;
}

/** 群成员信息 */
export interface GroupMemberInfo extends PostMessageGroupSender {
	/** 群号 */
	group_id: number;
	/** 加群时间戳 */
	join_time: number;
	/** 最后发言时间戳 */
	last_sent_time: number;
	/** 是否不良记录成员 */
	unfriendly: boolean;
	/** 专属头衔过期时间戳 */
	title_expire_time: number;
	/** 是否允许修改群名片 */
	card_changeable: boolean;
	/** 禁言到期时间 */
	shut_up_timestamp: number;
}

interface BaseHonor {
	user_id: number;
	nickname: string;
	avatar: string;
}

/** 当前龙王 */
interface CurrentTalkative extends BaseHonor {
	/** 持续天数 */
	day_count: number;
}

/** 其他荣誉 */
interface OtherHonor extends BaseHonor {
	/** 荣誉描述 */
	description: string;
}

/** 群荣誉信息 */
export interface GroupHonorInfo {
	/** 群号 */
	group_id: number;
	/** 当前龙王 */
	current_talkative?: CurrentTalkative;
	/** 历史龙王 */
	talkative_list?: OtherHonor[];
	/** 群聊之火 */
	performer_list?: OtherHonor[];
	/** 群聊炽焰 */
	legend_list?: OtherHonor[];
	/** 冒尖小春笋 */
	strong_newbie_list?: OtherHonor[];
	/** 快乐之源 */
	emotion_list?: OtherHonor[];
}

/** 公共群处理数据 */
interface baseRequest {
	/** 请求ID */
	request_id: number;
	/** 群号 */
	group_id: number;
	/** 群名 */
	group_name: string;
	/** 是否已被处理 */
	checked: boolean;
	/** 处理者, 未处理为0 */
	actor: number;
}

/** 邀请消息 */
interface InvitedRequest extends baseRequest {
	/** 邀请者 qq */
	invitor_uin: number;
	/** 邀请者昵称 */
	invitor_nick: string;
}

/** 进群消息 */
interface JoinRequest extends baseRequest {
	/** 请求者 qq */
	invitor_uin: number;
	/** 请求者昵称 */
	invitor_nick: string;
	/** 验证消息 */
	message: string;
}

/** 群系统消息 */
export interface GroupSystemMsg {
	/** 邀请消息列表 */
	invited_requests: InvitedRequest[] | null;
	/** 进群消息列表 */
	join_requests: JoinRequest[] | null;
}

/** 精华消息 */
export interface EssenceMessage {
	sender_id: number;
	/** 发送者 QQ */
	sender_nick: string;
	/** 发送者昵称 */
	sender_time: number;
	/** 操作者 QQ */
	operator_id: number;
	/** 操作者昵称 */
	operator_nick: string;
	/** 精华设置时间 */
	operator_time: number;
	/** 消息ID */
	message_id: number;
}

/** 群 @全体成员 剩余次数 */
export interface GroupAtAllRemain {
	/** 是否可以 @全体成员 */
	can_at_all: boolean;
	/** 群内所有管理当天剩余 @全体成员 次数 */
	remain_at_all_count_for_group: number;
	/** 当天剩余 @全体成员 次数 */
	remain_at_all_count_for_uin: number;
}

/** 群公告图片 */
interface GroupNoticeImage {
	/** 图片ID */
	id: string;
	/** 图片宽度 */
	width: string;
	/** 图片高度 */
	height: string;
}

/** 群公告 */
export interface GroupNotice {
	/** 公告发表者 */
	sender_id: number;
	/** 公告发表时间 */
	publish_time: number;
	message: {
		/** 公告内容 */
		text: string;
		/** 公告图片 */
		images: GroupNoticeImage[];
	}
}

/** 群文件系统信息 */
export interface GroupFileSystemInfo {
	/** 文件总数 */
	file_count: number;
	/** 文件上限 */
	limit_count: number;
	/** 已使用空间 */
	used_space: number;
	/** 空间上限 */
	total_space: number;
}

/** 群文件 */
interface GroupFile {
	/** 群号 */
	group_id: number;
	/** 文件ID */
	file_id: string;
	/** 文件名 */
	file_name: string;
	/** 文件类型 */
	busid: number;
	/** 文件大小 */
	file_size: number;
	/** 上传时间 */
	upload_time: number;
	/** 过期时间,永久文件恒为0 */
	dead_time: number;
	/** 最后修改时间 */
	modify_time: number;
	/** 下载次数 */
	download_times: number;
	/** 上传者ID */
	uploader: number;
	/** 上传者名字 */
	uploader_name: string;
}

/** 群文件夹 */
interface GroupFolder {
	/** 群号 */
	group_id: number;
	/** 文件夹ID */
	folder_id: string;
	/** 文件名 */
	folder_name: string;
	/** 创建时间 */
	create_time: number;
	/** 创建者 */
	creator: number;
	/** 创建者名字 */
	creator_name: string;
	/** 子文件数量 */
	total_file_count: number;
}

/** 群文件列表 */
export interface GroupFiles {
	/** 文件列表 */
	files: GroupFile[];
	/** 文件夹列表 */
	folders: GroupFolder[];
}

/** 群文件资源链接 */
export interface GroupFileUrl {
	/** 文件下载链接 */
	url: string;
}