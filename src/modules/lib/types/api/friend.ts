import { SexType } from "@/modules/lib/types/common";

/** 陌生人信息 */
export interface StrangerInfo {
	/** QQ 号 */
	user_id: number;
	/** 昵称 */
	nickname: string;
	/** 性别 */
	sex: SexType;
	/** 年龄 */
	age: number;
	/** ID身份卡 */
	qid: string;
	/** 等级 */
	level: number;
	/** 登录时长 */
	login_days: number;
}

/** 好友列表 */
export interface FriendInfo {
	/** QQ 号 */
	user_id: number;
	/** 昵称 */
	nickname: string;
	/** 备注名 */
	remark: string;
};

/** 单向好友列表 */
export interface UnidirectionalFriendInfo {
	/** QQ 号 */
	user_id: number;
	/** 昵称 */
	nickname: string;
	/** 来源 */
	source: string;
};