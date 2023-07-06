import * as e from "@/modules/lib/types/event";

export interface EventMap {
	/** 上线事件 */
	"system.online": ( event: e.SystemHeartbeatEvent ) => void;
	/** 下线事件 */
	"system.offline": ( event: e.SystemHeartbeatEvent ) => void;
	/** 生命周期事件 */
	"system.lifecycle": ( event: e.SystemLifecycleEvent ) => void;
	/** 系统事件 */
	"system": ( event: e.SystemEvent ) => void;
	
	/** 私聊（好友） */
	"message.private.friend": ( event: e.PrivateFriendMessageEvent ) => void;
	/** 私聊（临时会话） */
	"message.private.group": ( event: e.PrivateGroupMessageEvent ) => void;
	/** 私聊 */
	"message.private": ( event: e.PrivateMessageEvent ) => void;
	
	/** 群聊（普通） */
	"message.group.normal": ( event: e.GroupNormalMessageEvent ) => void;
	/** 群聊（匿名） */
	"message.group.anonymous": ( event: e.GroupAnonymousMessageEvent ) => void;
	/** 群聊 */
	"message.group": ( event: e.GroupMessageEvent ) => void;
	/** 消息 */
	"message": ( event: e.MessageEvent ) => void;
	
	/** 好友撤回 */
	"notice.friend.recall": ( event: e.PrivateRecallNoticeEvent ) => void;
	/** 好友添加 */
	"notice.friend.add": ( event: e.FriendAddNoticeEvent ) => void;
	/** 好友戳一戳 */
	"notice.friend.poke": ( event: e.FriendPokeNoticeEvent ) => void;
	/** 接收到离线文件 */
	"notice.friend.file": ( event: e.FriendOfflineFileNoticeEvent ) => void;
	/** 好友通知 */
	"notice.friend": ( event: e.NoticePrivateEvent ) => void;
	
	/** 群聊撤回 */
	"notice.group.recall": ( event: e.GroupRecallNoticeEvent ) => void;
	/** bot 进入群聊 */
	"notice.group.increase": ( event: e.GroupIncreaseNoticeEvent ) => void;
	/** bot 退出群聊 */
	"notice.group.decrease": ( event: e.GroupDecreaseNoticeEvent ) => void;
	/** 群成员增加 */
	"notice.group.member_increase": ( event: e.GroupIncreaseNoticeEvent ) => void;
	/** 群成员减少 */
	"notice.group.member_decrease": ( event: e.GroupDecreaseNoticeEvent ) => void;
	/** 群管理员变动 */
	"notice.group.admin": ( event: e.GroupAdminNoticeEvent ) => void;
	/** 群文件上传 */
	"notice.group.upload": ( event: e.GroupUploadNoticeEvent ) => void;
	/** 群禁言 */
	"notice.group.ban": ( event: e.GroupBanNoticeEvent ) => void;
	/** 群内戳一戳 */
	"notice.group.poke": ( event: e.GroupPokeNoticeEvent ) => void;
	/** 群红包运气王 */
	"notice.group.lucky_king": ( event: e.GroupLuckKingNoticeEvent ) => void;
	/** 群成员荣誉变更 */
	"notice.group.honor": ( event: e.GroupHonorNoticeEvent ) => void;
	/** 精华消息变更 */
	"notice.group.essence": ( event: e.GroupEssenceNoticeEvent ) => void;
	/** 群聊通知 */
	"notice.group": ( event: e.NoticeGroupEvent ) => void;
	/** 客户端状态变更 */
	"notice.client.status": ( event: e.ClientStatusNoticeEvent ) => void;
	/** 通知 */
	"notice": ( event: e.NoticeEvent ) => void;
	
	/** 好友申请 */
	"request.friend": ( event: e.FriendRequestEvent ) => void;
	/** 入群申请 */
	"request.group": ( event: e.GroupRequestEvent ) => void;
	/** 申请 */
	"request":( event: e.RequestEvent ) => void;
}