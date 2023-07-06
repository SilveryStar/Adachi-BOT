import * as api from "@/modules/lib/types/api";

export interface ApiMap {
	/** 获取登录号信息 */
	get_login_info: () => api.LoginInfo;
	/** 设置登录号资料 */
	set_qq_profile: ( param: api.SetQqProfileParam ) => void;
	/** 获取在线机型 */
	_get_model_show: ( param: api.GetModelShowParam ) => api.ModelShow;
	/** 设置在线机型 */
	_set_model_show: ( param: api.SetModelShowParam ) => void;
	/** 获取当前账号在线客户端列表 */
	get_online_clients: ( param: api.NoCacheParam ) => api.OnlineClients;
	/** 获取陌生人信息 */
	get_stranger_info: ( param: api.GetStrangerInfoParam ) => api.StrangerInfo;
	/** 获取好友列表 */
	get_friend_list: () => api.FriendInfo[];
	/** 获取单向好友列表 */
	get_unidirectional_friend_list: () => api.UnidirectionalFriendInfo[];
	/** 删除好友 */
	delete_friend: ( param: api.OperateUserParam ) => void;
	/** 删除单向好友 */
	delete_unidirectional_friend: ( param: api.OperateUserParam ) => void;
	/** 发送私聊消息 */
	send_private_msg: ( param: api.SendPrivateMsgParam ) => api.SendMessage;
	/** 发送群聊消息 */
	send_group_msg: ( param: api.SendGroupMsgParam ) => api.SendMessage;
	/** 发送消息 */
	send_msg: ( param: api.SendMsgParam ) => api.SendMessage;
	/** 获取消息 */
	get_msg: ( param: api.OperateMessageParam ) => api.GetMessage;
	/** 撤回消息 */
	delete_msg: ( param: api.OperateMessageParam ) => void;
	/** 标记消息已读 */
	mark_msg_as_read: ( param: api.OperateMessageParam ) => void;
	/** 获取合并转发内容 */
	get_forward_msg: ( param: api.OperateMessageParam ) => api.ForwardMessage;
	/** 发送合并转发 ( 群聊 ) */
	send_group_forward_msg: ( param: api.SendGroupForwardMsgParam ) => api.SendForwardMessage;
	/** 发送合并转发 ( 好友 ) */
	send_private_forward_msg: ( param: api.SendPrivateForwardMsgParam ) => api.SendForwardMessage;
	/** 获取群消息历史记录 */
	get_group_msg_history: ( param: api.GetGroupMsgHistoryParam ) => api.GroupMsgHistory;
	/** 获取图片信息 */
	get_image: ( param: api.GetImageParam ) => api.ImageInfo;
	/** 检查是否可以发送图片 */
	can_send_image: () => api.CheckResult;
	/** 图片 OCR */
	ocr_image: ( param: api.OcrImageParam ) => api.OcrImage;
	/** 获取语音 */
	get_record: ( param: api.GetRecordParam ) => api.RecordInfo;
	/** 检查是否可以发送语音 */
	can_send_record: () => api.CheckResult;
	/** 处理加好友请求 */
	set_friend_add_request: ( param: api.SetFriendAddRequestParam ) => void;
	/** 处理加群请求／邀请 */
	set_group_add_request: ( param: api.SetGroupAddRequestParam ) => void;
	/** 获取群信息 */
	get_group_info: ( param: api.GetGroupInfoParam ) => api.GroupInfo;
	/** 获取群列表 */
	get_group_list: ( param: api.NoCacheParam ) => api.GroupInfo[];
	/** 获取群成员信息 */
	get_group_member_info: ( param: api.GetGroupMemberInfoParam ) => api.GroupMemberInfo;
	/** 获取群成员列表 */
	get_group_member_list: ( param: api.GetGroupInfoParam ) => api.GroupMemberInfo[];
	/** 获取群荣誉信息 */
	get_group_honor_info: ( param: api.GetGroupHonorInfoParam ) => api.GroupHonorInfo;
	/** 获取群系统消息 */
	get_group_system_msg: () => api.GroupSystemMsg;
	/** 获取精华消息列表 */
	get_essence_msg_list: ( param: api.OperateGroupParam ) => api.EssenceMessage[];
	/** 获取群 @全体成员 剩余次数 */
	get_group_at_all_remain: ( param: api.OperateGroupParam ) => api.GroupAtAllRemain;
	/** 设置群名 */
	set_group_name: ( param: api.SetGroupNameParam ) => void;
	/** 设置群头像 */
	set_group_portrait: ( param: api.SetGroupPortraitParam ) => void;
	/** 设置群管理员 */
	set_group_admin: ( param: api.SetGroupAdminParam ) => void;
	/** 设置群名片 ( 群备注 ) */
	set_group_card: ( param: api.SetGroupCardParam ) => void;
	/** 设置群组专属头衔 */
	set_group_special_title: ( param: api.SetGroupSpecialTitleParam ) => void;
	/** 群单人禁言 */
	set_group_ban: ( param: api.SetGroupBanParam ) => void;
	/** 群全员禁言 */
	set_group_whole_ban: ( param: api.SetGroupWholeBanParam ) => void;
	/** 群匿名用户禁言 */
	set_group_anonymous_ban: ( param: api.SetGroupAnonymousBanParam ) => void;
	/** 设置精华消息 */
	set_essence_msg: ( param: api.OperateMessageParam ) => void;
	/** 移出精华消息 */
	delete_essence_msg: ( param: api.OperateMessageParam ) => void;
	/** 群打卡 */
	send_group_sign: ( param: api.OperateGroupParam ) => void;
	/** 群设置匿名 */
	set_group_anonymous: ( param: api.SetGroupAnonymousParam ) => void;
	/** 发送群公告 */
	_send_group_notice: ( param: api.SendGroupNoticeParam ) => void;
	/** 获取群公告 */
	_get_group_notice: ( param: api.OperateGroupParam ) => api.GroupNotice[];
	/** 群组踢人 */
	set_group_kick: ( param: api.SetGroupKickParam ) => void;
	/** 退出群组 */
	set_group_leave: ( param: api.SetGroupLeaveParam ) => void;
	/** 上传群文件 */
	upload_group_file: ( param: api.UploadGroupFileParam ) => void;
	/** 删除群文件 */
	delete_group_file: ( param: api.OperateGroupFileParam ) => void;
	/** 创建群文件文件夹 */
	create_group_file_folder: ( param: api.CreateGroupFileFolderParam ) => void;
	/** 删除群文件文件夹 */
	delete_group_folder: ( param: api.OperateGroupFolderParam ) => void;
	/** 获取群文件系统信息 */
	get_group_file_system_info: ( param: api.OperateGroupParam ) => api.GroupFileSystemInfo;
	/** 获取群根目录文件列表 */
	get_group_root_files: ( param: api.OperateGroupParam ) => api.GroupFiles;
	/** 获取群子目录文件列表 */
	get_group_files_by_folder: ( param: api.OperateGroupFolderParam ) => api.GroupFiles;
	/** 获取群文件资源链接 */
	get_group_file_url: ( param: api.OperateGroupFileParam ) => api.GroupFileUrl;
	/** 上传私聊文件 */
	upload_private_file: ( param: api.UploadPrivateFileParam ) => void;
	/** 获取版本信息 */
	get_version_info: () => api.GoCqVersionInfo;
	/** 获取状态 */
	get_status: () => api.GoCqStatus;
	/** 重载事件过滤器 */
	reload_event_filter: ( param: api.ReloadEventFilterParam ) => void;
	/** 下载文件到缓存目录 */
	download_file: ( param: api.DownloadFileParam ) => api.GoCqDownloadFile;
	/** 检查链接安全性 */
	check_url_safely: ( param: api.CheckUrlSafelyParam ) => api.CheckUrlSafely;
	/** 获取中文分词 ( 隐藏 API ) */
	".get_word_slices": ( param: api.GetWordSlicesParam ) => api.WordSlices;
}