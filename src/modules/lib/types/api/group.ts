import { PostMessageGroupSender } from "@/modules/lib/types/common";

/** 群信息 */
export interface GroupInfo {
	/** 群号 */
	group_id: number;
	/** 群名称 */
	group_name: string;
	/** @deprecated go-cqhttp 限定 群备注 */
	group_memo?: string;
	/** @deprecated go-cqhttp 限定 群创建时间 */
	group_create_time?: number;
	/** @deprecated go-cqhttp 限定 群等级 */
	group_level?: number;
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
	/** @deprecated go-cqhttp 限定，禁言到期时间 */
	shut_up_timestamp?: number;
	/** @deprecated go-cqhttp 限定，是否被禁言 */
	is_shut_up?: boolean;
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

/** Cookies */
export interface GetCookies {
	cookies: string;
}

/** CsrfToken */
export interface GetCsrfToken {
	token: number;
}

/** Credentials */
export interface GetCredentials extends GetCookies, GetCsrfToken {}

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

/** 群 @全体成员 剩余次数 */
export interface GroupAtAllRemain {
	/** 是否可以 @全体成员 */
	can_at_all: boolean;
	/** 群内所有管理当天剩余 @全体成员 次数 */
	remain_at_all_count_for_group: number;
	/** 当天剩余 @全体成员 次数 */
	remain_at_all_count_for_uin: number;
}