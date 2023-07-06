/** https://docs.go-cqhttp.org/reference/data_struct.html#post-message-tempsource */

/** 匿名消息 */
export interface Anonymous {
	id: number,
	name: string,
	flag: string,
}

/** 音频类型 */
export type RecordFormat = "mp3" | "amr" | "wma" | "m4a" | "spx" | "ogg" | "wav" | "flac";

/** 群荣誉类型 */
export type HonorType = "talkative" | "performer" | "legend" | "strong_newbie" | "emotion";

/** 请求类型 */
export type PostType = "message" | "message_sent" | "request" | "notice" | "meta_event";

/** 性别 */
export type SexType = "male" | "female" | "unknown";

/** 性别 */
export type GroupRole = "owner" | "admin" | "member";

/** 消息通用发送者 */
export interface PostMessageCommonSender {
	user_id: number;
	nickname: string;
	sex: SexType;
	age: number;
}

/** 私聊消息发送者 */
export interface PostMessagePrivateSender extends PostMessageCommonSender {
	group_id?: number;
}

/** 群聊消息发送者 */
export interface PostMessageGroupSender extends PostMessageCommonSender {
	card: string;
	area: string;
	level: string;
	role: "owner" | "admin" | "member";
	title: string;
}

/** 消息发送者 */
export type PostMessageSender = PostMessagePrivateSender | PostMessageGroupSender;

/** 消息类型 */
export type PostMessageType = "private" | "group";

/** 消息子类型 */
export type PostMessageSubType = "friend" | "normal" | "anonymous" | "group";

/** 传输类型 */
export type PostMessageTempSource = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

/** 请求类型 */
export type PostRequestType = "friend" | "group";

/** 通知类型 */
export type PostNoticeType = "group_upload" | "group_admin" | "group_decrease" | "group_increase" | "group_ban" | "friend_add" |
	"group_recall" | "friend_recall" | "group_card" | "offline_file" | "client_status" | "essence" | "notify";

/** 系统通知的子类型 */
export type PostNoticeNotifySubType = "honor" | "poke" | "lucky_king" | "title";

/** 元事件类型 */
export type PostMetaEventType = "lifecycle" | "heartbeat";

/**
 * 运行统计
 */
interface StatusStat {
	packet_received: number;
	packet_sent: number;
	packet_lost: number;
	message_received: number;
	message_sent: number;
	disconnect_times: number;
	lost_times: number;
	last_message_time: number;
}

/*状态*/
export interface Status {
	/** * 原 CQHTTP 字段, 恒定为 true  */
	app_initialized: true;
	/** 原 CQHTTP 字段, 恒定为 true */
	app_enabled: true;
	/** 原 CQHTTP 字段, 恒定为 true */
	plugins_good: true;
	/** 原 CQHTTP 字段, 恒定为 true */
	app_good: true;
	/** 表示BOT是否在线 */
	online: boolean;
	/** 运行统计 */
	stat: StatusStat;
}

/** 生命周期上报的子类型 */
export type MetaEventLifecycleType = "enable" | "disable" | "connect";