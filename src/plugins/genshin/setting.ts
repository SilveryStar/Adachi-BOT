import { AuthLevel } from "@modules/management/auth";
import { MessageScope } from "@modules/message";
import { OrderConfig, SwitchConfig } from "@modules/command";
import { PluginSetting } from "@modules/plugin";

const bind: OrderConfig = {
	type: "order",
	cmdKey: "silvery-star.bind",
	desc: [ "绑定", "[UID|-r]" ],
	headers: [ "bind" ],
	regexps: [ "(\\d{9}|-r)" ],
	main: "achieves/bind",
	detail: "将qq与uid绑定，使用-r解除绑定"
};

const uidQuery: OrderConfig = {
	type: "order",
	cmdKey: "silvery-star.uid-query",
	desc: [ "游戏查询", "(UID|@)" ],
	headers: [ "uid" ],
	regexps: [
		[ "(\\d{9})?" ],
		[ "\\[CQ:at,qq=\\d+.*]" ]
	],
	main: "achieves/uid-query",
	stop: false
};

const getArtifact: OrderConfig = {
	type: "order",
	cmdKey: "silvery-star.art",
	desc: [ "抽圣遗物", "(秘境ID)" ],
	headers: [ "art" ],
	regexps: [ "\\d*" ],
	main: "achieves/artifact"
};

const impArtifact: OrderConfig = {
	type: "order",
	cmdKey: "silvery-star.imp",
	desc: [ "强化", "" ],
	headers: [ "imp" ],
	regexps: [],
	main: "achieves/improve"
};

const domain: OrderConfig = {
	type: "order",
	cmdKey: "silvery-star.dom",
	desc: [ "秘境查询", "" ],
	headers: [ "dom" ],
	regexps: [],
	main: "achieves/domain"
};

const wish: OrderConfig = {
	type: "order",
	cmdKey: "silvery-star.wish",
	desc: [ "祈愿", "[十连次数|until]" ],
	headers: [ "wish", "w" ],
	regexps: [ "(\\d{1,2}|until)?" ],
	main: "achieves/wish",
	detail: "抽卡次数可以填写 1~99，表示十连抽的次数，默认为 1\n" +
		"使用 until 的时候会一直抽到 UP 武器或角色"
};

const epitomizedPath: OrderConfig = {
	type: "order",
	cmdKey: "silvery-star.epitomized-path",
	desc: [ "神器定轨", "(0|1|2)" ],
	headers: [ "epit" ],
	regexps: [ "(0|1|2)?" ],
	main: "achieves/epitomized",
	detail: "神器定轨，不添加参数查看当前 UP 的武器\n" +
		"添加 1 或 2 定规武器，0 取消定轨"
};

const choosePool: OrderConfig = {
	type: "order",
	cmdKey: "silvery-star.choose-pool",
	desc: [ "切换卡池", "[角色|武器|常驻|角色2]" ],
	headers: [ "choose", "t" ],
	regexps: [ "(角色|武器|常驻|角色2)" ],
	main: "achieves/choose"
};

const information: OrderConfig = {
	type: "order",
	cmdKey: "silvery-star.information",
	desc: [ "信息", "[角色|武器名|圣遗物] (-skill)" ],
	headers: [ "info" ],
	regexps: [ "[\\w\\u4e00-\\u9fa5]+", "(-skill)?" ],
	main: "achieves/info",
	detail: "使用 -skill 来查看角色元素战技与元素爆发详情\n" +
		"武器与圣遗物不可使用该配置项"
};

const slip: OrderConfig = {
	type: "order",
	cmdKey: "by-ha.slip",
	desc: [ "御神签", "" ],
	headers: [ "s" ],
	regexps: [],
	main: "achieves/slip"
};

const alias: SwitchConfig = {
	type: "switch",
	mode: "single",
	cmdKey: "silvery-star.alias-customize",
	desc: [ "修改别名", "#{OPT} [本名] [别名]" ],
	header: "alias",
	regexp: [ "#{OPT}", "[\\u4e00-\\u9fa5]+", "[\\w\\u4e00-\\u9fa5]+" ],
	main: "achieves/alias",
	auth: AuthLevel.Manager,
	onKey: "add",
	offKey: "rem",
	detail: "本指令用于修改角色或武器名的别名\n" +
		"如当你为「枫原万叶」设置别名「天帝」后\n" +
		"使用角色信息、信息查询等功能时\n" +
		"「天帝」会被自动识别为「枫原万叶」"
};

const daily: SwitchConfig = {
	type: "switch",
	mode: "single",
	cmdKey: "silvery-star.daily",
	desc: [ "材料订阅", "#{OPT} [角色|武器|群号|活动]" ],
	header: "sub",
	regexp: [ "#{OPT}", "[\\w\\u4e00-\\u9fa5]+" ],
	main: "achieves/daily",
	onKey: "add",
	offKey: "rem",
	detail: "为自己添加/删除角色天赋/武器的突破材料以及当前进行中的活动订阅\n" +
		"每天的 6:00~7:00 随机时间进行推送\n" +
		"若使用群号，则将在 6:00 向该群发送所有信息"
};

const today: OrderConfig = {
	type: "order",
	cmdKey: "silvery-star.today",
	desc: [ "日历", "(星期)" ],
	headers: [ "today" ],
	regexps: [ "[1-7]?" ],
	main: "achieves/today",
	detail: "跟随数字 1-7 来查询指定日的全部素材"
};

const guide: OrderConfig = {
	type: "order",
	cmdKey: "silvery-star.guide",
	desc: [ "攻略", "[角色名]" ],
	headers: [ "guide" ],
	regexps: [ "[\\w\\u4e00-\\u9fa5]+" ],
	main: "achieves/guide"
};

const almanac: OrderConfig = {
	type: "order",
	cmdKey: "silvery-star.almanac",
	desc: [ "原神黄历", "" ],
	headers: [ "alm" ],
	regexps: [],
	main: "achieves/almanac"
};

/* 私人服务指令 */
const privateSubscribe: OrderConfig = {
	type: "order",
	cmdKey: "silvery-star.private-subscribe",
	desc: [ "添加私人服务", "" ],
	headers: [ "ps" ],
	regexps: [],
	main: "achieves/private/subscribe",
	scope: MessageScope.Private,
	detail: "私人服务，一类通过使用个人 cookie 获取私密信息\n" +
			"目前包含实时便笺订阅功能，未来可能会添加新功能"
};

const privateConfirm: OrderConfig = {
	type: "order",
	cmdKey: "silvery-star.private-confirm",
	desc: [ "验证私人服务", "" ],
	headers: [ "confirm" ],
	regexps: [ ".+" ],
	display: false,
	ignoreCase: false,
	main: "achieves/private/subscribe",
	scope: MessageScope.Private
};

const privateSubList: OrderConfig = {
	type: "order",
	cmdKey: "silvery-star.private-list",
	desc: [ "私人服务列表", "" ],
	headers: [ "pl" ],
	regexps: [],
	main: "achieves/private/get-list",
	scope: MessageScope.Private
};

const privateCancel: OrderConfig = {
	type: "order",
	cmdKey: "silvery-star.private-cancel",
	desc: [ "取消私人服务", "[账户序号]" ],
	headers: [ "pc" ],
	regexps: [ "\\d+" ],
	main: "achieves/private/cancel",
	scope: MessageScope.Private,
	detail: "账户序号在私人服务列表中查看"
};

const privateRemove: OrderConfig = {
	type: "order",
	cmdKey: "silvery-star.private-remove",
	desc: [ "移除用户私人服务", "[qq]" ],
	headers: [ "remove" ],
	regexps: [ "\\d+" ],
	main: "achieves/private/remove",
	auth: AuthLevel.Master,
	detail: "移除指定qq号所绑定的所有私人服务\n" +
			"移除后将会给对方发送提示信息"
};

const privateReplace: OrderConfig = {
	type: "order",
	cmdKey: "silvery-star.private-replace",
	desc: [ "更新私人服务", "[账户序号] [cookie]" ],
	headers: [ "pr" ],
	regexps: [ "\\d+", ".+" ],
	ignoreCase: false,
	main: "achieves/private/replace",
	scope: MessageScope.Private,
	detail: "账户序号在私人服务列表中查看\n" +
			"该指令用于更换私人服务所绑定的 cookie"
};

const privateReorder: OrderConfig = {
	type: "order",
	cmdKey: "silvery-star.private-reorder",
	desc: [ "排序服务列表", "[当前序号的新排序列表]" ],
	headers: [ "reorder" ],
	regexps: [ "(\\s|\\d)+" ],
	main: "achieves/private/reorder",
	scope: MessageScope.Private,
	detail: "对当前的私人服务列表的顺序重新调整\n" +
			"例如用户有 5 个订阅的私人服务账号，则新排序列表的格式为：5 2 3 1 4"
};

const privateNowNote: OrderConfig = {
	type: "order",
	cmdKey: "silvery-star.now-note",
	desc: [ "实时便笺", "" ],
	headers: [ "note" ],
	regexps: [],
	main: "achieves/private/note/now"
};

const privateNoteEvent: OrderConfig = {
	type: "order",
	cmdKey: "silvery-star.note-set-time",
	desc: [ "便笺推送时间", "[账户序号] [树脂量]" ],
	headers: [ "nt" ],
	regexps: [ "[\\d ]+" ],
	main: "achieves/private/note/set-time",
	scope: MessageScope.Private,
	detail: "用于设置 BOT 自动提醒时间点，树脂量可设置多个\n" +
			"如: 60 90 120 160，数字间用空格隔开"
};

const privateMysSetAppoint: OrderConfig = {
	type: "order",
	cmdKey: "silvery-star.private-set-appoint",
	desc: [ "指定头像", "[账户序号] [角色名]" ],
	headers: [ "appoint" ],
	regexps: [ "\\d+", "[\\w\\u4e00-\\u9fa5]+" ],
	main: "achieves/private/query/appoint",
	scope: MessageScope.Private,
	detail: "该指令用于指定查询卡片中的头像图片"
};

const privateMysQuery: OrderConfig = {
	type: "order",
	cmdKey: "silvery-star.private-mys",
	desc: [ "游戏查询", "(账户序号)" ],
	headers: [ "mys" ],
	regexps: [ "(\\d+)?" ],
	main: "achieves/private/query/mys"
};

const privateAbyssQuery: SwitchConfig = {
	type: "switch",
	mode: "divided",
	cmdKey: "silvery-star.private-abyss",
	desc: [ "深渊查询", "(账户序号) (-l)" ],
	header: "",
	regexp: [ "(\\d+)?", "(-l)?" ],
	main: "achieves/private/query/abyss",
	stop: false,
	onKey: "caby",
	offKey: "laby",
	detail: "分别为查询上期与本期的深渊数据\n" +
			"使用 -l 以转发消息方式显示每层详细图片"
};

const privateCharQuery: OrderConfig = {
	type: "order",
	cmdKey: "silvery-star.private-character",
	desc: [ "角色信息", "(账户序号) [角色名]" ],
	headers: [ "char" ],
	regexps: [ "(\\d+)?", "[\\w\\u4e00-\\u9fa5]+" ],
	main: "achieves/private/query/character",
	detail: "查询对应的私人服务的账户的游戏内角色信息\n" +
			"默认查询查询 1 号私人服务账户"
};

const privateToggleSign: OrderConfig = {
	type: "order",
	cmdKey: "silvery-star.private-toggle-sign",
	desc: [ "米游社签到", "[账户序号]" ],
	headers: [ "signin" ],
	regexps: [ "\\d+" ],
	main: "achieves/private/sign-in/main",
	scope: MessageScope.Private,
	detail: "该指令用于切换米游社签到的开/关状态"
};

const privateToggleNote: OrderConfig = {
	type: "order",
	cmdKey: "silvery-star.private-toggle-note",
	desc: [ "定时提醒", "[账户序号]" ],
	headers: [ "tnote" ],
	regexps: [ "\\d+" ],
	main: "achieves/private/note/toggle",
	scope: MessageScope.Private,
	detail: "该指令用于切换树脂及冒险探索定时提示的开/关状态"
};

const privateLedger: OrderConfig = {
	type: "order",
	cmdKey: "silvery-star.private-ledger",
	desc: [ "旅行札记", "(账户序号) (月份)" ],
	headers: [ "led" ],
	regexps: [ "(\\d+)?", "(\\d+)?" ],
	main: "achieves/private/query/ledger",
	detail: "查看旅行者札记数据\n" +
			"只填写一个参数时将被视为月份"
};

export default <PluginSetting>{
	pluginName: "genshin",
	cfgList: [
		bind, today, privateCharQuery, daily,
		guide, information, alias, domain,
		getArtifact, impArtifact, wish, choosePool,
		epitomizedPath, slip, uidQuery, privateMysQuery,
		almanac, privateMysSetAppoint, privateSubscribe, privateReplace,
		privateConfirm, privateCancel, privateRemove,
		privateSubList, privateReorder, privateToggleSign,
		privateToggleNote, privateNoteEvent, privateNowNote,
		privateAbyssQuery, privateLedger,
	]
};