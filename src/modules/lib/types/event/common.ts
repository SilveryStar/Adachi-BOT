import { PostType } from "../common";

/** 通用 */
export interface CommonEvent {
	/** bot qq */
	self_id: number;
	/** 当前时间戳 */
	time: number;
	/** 事件类型 */
	post_type: PostType;
}