import { CommonEvent } from "./common";
import { PostRequestType } from "../common";

/** 请求  */
export type RequestEvent = FriendRequestEvent | GroupRequestEvent;

/** 通用请求 */
interface CommonRequestEvent extends CommonEvent {
	/** 事件类型 */
	post_type: "request";
	/** 请求类型 */
	request_type: PostRequestType;
}

/** 加好友请求 */
export interface FriendRequestEvent extends CommonRequestEvent {
	/** 请求类型 */
	request_type: "friend";
	/** 发送请求的 QQ */
	user_id: number;
	/** 验证信息 */
	comment: string;
	/** 请求 flag, 在调用处理请求的 API 时需要传入 */
	flag: string;
	/** 快捷通过请求 remark:添加后的好友备注 */
	approve( approve: boolean, remark?: string ): void;
}

/** 进群请求 */
export interface GroupRequestEvent extends CommonRequestEvent {
	/** 请求类型 */
	request_type: "group";
	/** 请求子类型: 加群请求/邀请登录号入群 */
	sub_type: "add" | "invite";
	/** 群号 */
	group_id: number;
	/** 发送请求的 QQ */
	user_id: number;
	/** 验证信息 */
	comment: string;
	/** 请求 flag, 在调用处理请求的 API 时需要传入 */
	flag: string;
	/** 快捷通过请求 reason:拒绝原因 */
	approve( approve: boolean, reason?: string ): void;
}