import * as api from "@/modules/lib/types/api";
import { OneBotVersionInfo } from "@/modules/lib/types/api";

export interface ApiMap {
	/** 发送私聊消息 */
	send_private_msg: ( param: api.SendPrivateMsgParam ) => api.SendMessage;
	/** 发送群聊消息 */
	send_group_msg: ( param: api.SendGroupMsgParam ) => api.SendMessage;
	/** 发送消息 */
	send_msg: ( param: api.SendMsgParam ) => api.SendMessage;
	/** 撤回消息 */
	delete_msg: ( param: api.OperateMessageParam ) => void;
	/** 获取消息 */
	get_msg: ( param: api.OperateMessageParam ) => api.GetMessage;
	/** 获取合并转发内容 */
	get_forward_msg: ( param: api.OperateMessageParam ) => api.ForwardMessage;
	/** 发送好友赞 */
	send_like: ( param: api.SendLikeParam ) => void;
	/** 群组踢人 */
	set_group_kick: ( param: api.SetGroupKickParam ) => void;
	/** 群单人禁言 */
	set_group_ban: ( param: api.SetGroupBanParam ) => void;
	/** 群匿名用户禁言 */
	set_group_anonymous_ban: ( param: api.SetGroupAnonymousBanParam ) => void;
	/** 群全员禁言 */
	set_group_whole_ban: ( param: api.SetGroupWholeBanParam ) => void;
	/** 设置群管理员 */
	set_group_admin: ( param: api.SetGroupAdminParam ) => void;
	/** 群设置匿名 */
	set_group_anonymous: ( param: api.SetGroupAnonymousParam ) => void;
	/** 设置群名片 ( 群备注 ) */
	set_group_card: ( param: api.SetGroupCardParam ) => void;
	/** 设置群名 */
	set_group_name: ( param: api.SetGroupNameParam ) => void;
	/** 退出群组 */
	set_group_leave: ( param: api.SetGroupLeaveParam ) => void;
	/** 设置群组专属头衔 */
	set_group_special_title: ( param: api.SetGroupSpecialTitleParam ) => void;
	/** 处理加好友请求 */
	set_friend_add_request: ( param: api.SetFriendAddRequestParam ) => void;
	/** 处理加群请求／邀请 */
	set_group_add_request: ( param: api.SetGroupAddRequestParam ) => void;
	/** 获取登录号信息 */
	get_login_info: () => api.LoginInfo;
	/** 获取陌生人信息 */
	get_stranger_info: ( param: api.GetStrangerInfoParam ) => api.StrangerInfo;
	/** 获取好友列表 */
	get_friend_list: () => api.FriendInfo[];
	/** 获取群信息 */
	get_group_info: ( param: api.GetGroupInfoParam ) => api.GroupInfo;
	/** 获取群列表 */
	get_group_list: () => api.GroupInfo[];
	/** 获取群成员信息 */
	get_group_member_info: ( param: api.GetGroupMemberInfoParam ) => api.GroupMemberInfo;
	/** 获取群成员列表 */
	get_group_member_list: ( param: api.OperateGroupParam ) => api.GroupMemberInfo[];
	/** 获取群荣誉信息 */
	get_group_honor_info: ( param: api.GetGroupHonorInfoParam ) => api.GroupHonorInfo;
	/** 获取群荣誉信息 */
	get_cookies: ( param: api.GetCookiesParam ) => api.GetCookies;
	/** 获取群荣誉信息 */
	get_csrf_token: () => api.GetCsrfToken;
	/**  获取客户端相关接口凭证 */
	get_credentials : ( param: api.GetCookiesParam ) => api.GetCredentials;
	/** 获取语音 */
	get_record: ( param: api.GetRecordParam ) => api.RecordInfo;
	/** 获取图片信息 */
	get_image: ( param: api.GetImageParam ) => api.ImageInfo;
	/** 检查是否可以发送图片 */
	can_send_image: () => api.CheckResult;
	/** 检查是否可以发送语音 */
	can_send_record: () => api.CheckResult;
	/** 获取状态 */
	get_status: () => api.OneBotStatus;
	/** 获取版本信息 */
	get_version_info: () => api.OneBotVersionInfo;
	/** 重启 OneBot 实现 */
	set_restart: ( param: api.RestartParam ) => void;
	/** 清理缓存 */
	clean_cache: () => void;
	/** @deprecated go-cqhttp 限定，删除好友 */
	delete_friend: ( param: api.OperateUserParam ) => void;
	/** @deprecated go-cqhttp 限定，发送合并转发 ( 群聊 ) */
	send_group_forward_msg: ( param: api.SendGroupForwardMsgParam ) => api.SendForwardMessage;
	/** @deprecated go-cqhttp 限定，发送合并转发 ( 好友 ) */
	send_private_forward_msg: ( param: api.SendPrivateForwardMsgParam ) => api.SendForwardMessage;
	/** @deprecated go-cqhttp 限定，获取群消息历史记录 */
	get_group_msg_history: ( param: api.GetGroupMsgHistoryParam ) => api.GroupMsgHistory;
	/** @deprecated go-cqhttp 限定，获取群 @全体成员 剩余次数 */
	get_group_at_all_remain: ( param: api.OperateGroupParam ) => api.GroupAtAllRemain;
}