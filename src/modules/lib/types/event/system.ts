import { CommonEvent } from "./common";
import { PostMetaEventType, Status } from "../common";

/** 系统 */
export type SystemEvent = SystemHeartbeatEvent | SystemLifecycleEvent;

/** 通用元事件 */
interface CommonSystemEvent extends CommonEvent {
	/** 事件类型 */
	post_type: "meta_event";
	/** 元数据类型 */
	meta_event_type: PostMetaEventType;
}

/** 心跳包 */
export interface SystemHeartbeatEvent extends CommonSystemEvent {
	/** 元数据类型 */
	meta_event_type: "heartbeat";
	/** 应用程序状态 */
	status: Status;
	/** 距离上一次心跳包的时间(单位是毫秒) */
	interval: number;
}

/** 生命周期 */
export interface SystemLifecycleEvent extends CommonSystemEvent {
	/** 元数据类型 */
	meta_event_type: "lifecycle";
	/**
	 * 子类型
	 * @description connect 指 WebSocket 连接成功，由于 Adachi-BOT 仅使用正向 ws 连接，其他两种类型不会出现
	 */
	sub_type: "connect";
}