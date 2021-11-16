import { AuthLevel } from "@modules/management/auth";
import { MessageScope } from "@modules/message";
import { OrderConfig, SwitchConfig } from "@modules/command";
import { PluginSetting } from "@modules/plugin";

const bind: OrderConfig = {
	type: "order",
	cmdKey: "silvery-star.bind",
	desc: [ "米游社绑定", "[通行证]" ],
	headers: [ "bind" ],
	regexps: [ "\\d+" ],
	main: "achieves/bind",
	detail: "在 米游社app->我的 中即可查看通行证ID\n" +
			"或在浏览器上访问 user.mihoyo.com -> 账号信息查看"
};

const mysQuery: OrderConfig = {
	type: "order",
	cmdKey: "silvery-star.mys-query",
	desc: [ "游戏查询", "(通行证|@)" ],
	headers: [ "mys" ],
	regexps: [
		[ "(\\d+)?" ],
		[ "\\[CQ:at,qq=[0-9]+.*]" ]
	],
	main: "achieves/mys-query",
	detail: "此指令支持三种查询方式：\n" +
			"  1. 不添加参数，查询自己的绑定账户的数据\n" +
			"  2. 使用米游社通行证，查询对应用户的数据\n" +
			"  3. @某人，查询对应用户绑定的账户的数据"
};

const uidQuery: OrderConfig = {
	type: "order",
	cmdKey: "silvery-star.uid-query",
	desc: [ "游戏查询", "[UID]" ],
	headers: [ "uid" ],
	regexps: [ "\\d{9}" ],
	main: "achieves/uid-query"
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
	desc: [ "十连抽卡", "" ],
	headers: [ "wish", "w" ],
	regexps: [],
	main: "achieves/wish"
};

const choosePool: OrderConfig = {
	type: "order",
	cmdKey: "silvery-star.choose-pool",
	desc: [ "切换卡池", "[角色|武器|常驻]" ],
	headers: [ "choose", "t" ],
	regexps: [ "(角色|武器|常驻)" ],
	main: "achieves/choose"
};

const character: OrderConfig = {
	type: "order",
	cmdKey: "silvery-star.character",
	desc: [ "角色信息", "[角色名]" ],
	headers: [ "char" ],
	regexps: [ "[\\w\\u4e00-\\u9fa5]+" ],
	main: "achieves/character",
	detail: "查询某角色的游戏内装备信息\n" +
			"查询对象为一小时内最近查询过的用户的信息\n" +
			"若一小时内没有进行过任何 mys 或 uid 操作\n" +
			"则将会查询自己绑定的米游社账号"
};

const information: OrderConfig = {
	type: "order",
	cmdKey: "silvery-star.information",
	desc: [ "信息查询", "[角色|武器名]" ],
	headers: [ "info" ],
	regexps: [ "[\\w\\u4e00-\\u9fa5]+" ],
	main: "achieves/info"
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
	regexp:[ "#{OPT}", "[\\u4e00-\\u9fa5]+", "[\\w\\u4e00-\\u9fa5]+" ],
	main: "achieves/alias",
	auth: AuthLevel.Manager,
	onKey: "add",
	offKey: "rem",
	detail: "本指令用于修改角色或武器名的别名\n" +
			"如当你为「枫原万叶」设置别名「天帝」后\n" +
			"使用角色信息、信息查询等功能时\n" +
			"「天帝」会被自动识别为「枫原万叶」"
};

const abyss: SwitchConfig = {
	type: "switch",
	mode: "divided",
	cmdKey: "silvery-star.abyss",
	desc: [ "深渊查询", "(UID|@) #{OPT}" ],
	header: "",
	regexp: [ "(\\d{9}|\\[CQ:at,qq=\\d+.*])?", "#{OPT}" ],
	main: "achieves/abyss-query",
	onKey: "caby",
	offKey: "laby"
};

const daily: SwitchConfig = {
	type: "switch",
	mode: "single",
	cmdKey: "silvery-star.daily",
	desc: [ "材料订阅", "#{OPT} [角色|武器名|群号]" ],
	header: "sub",
	regexp: [ "#{OPT}", "[\\w\\u4e00-\\u9fa5]+" ],
	main: "achieves/daily",
	onKey: "add",
	offKey: "rem",
	detail: "为自己添加/删除角色天赋/武器的突破材料\n" +
			"每天的 6:00~7:00 随机时间进行推送\n" +
			"若使用群号，则将在 6:00 向该群发送所有信息"
};

const today: OrderConfig = {
	type: "order",
	cmdKey: "silvery-star.today",
	desc: [ "今日素材", "" ],
	headers: [ "today" ],
	regexps: [],
	main: "achieves/today"
};

const guide: OrderConfig = {
	type: "order",
	cmdKey: "silvery-star.guide",
	desc: [ "角色攻略", "[角色名]" ],
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
	desc: [ "私人服务", "" ],
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
	desc: [ "", "" ],
	headers: [ "confirm" ],
	regexps: [ ".+" ],
	display: false,
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
	desc: [ "取消私人服务", "[账户编号]" ],
	headers: [ "pc" ],
	regexps: [ "\\d+" ],
	main: "achieves/private/cancel",
	scope: MessageScope.Private,
	detail: "账户编号在私人服务列表中查看"
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
	desc: [ "便笺推送时间", "[账户编号] [树脂量]" ],
	headers: [ "nt" ],
	regexps: [ "[\\d ]+" ],
	main: "achieves/private/note/set-time",
	scope: MessageScope.Private,
	detail: "用于设置 BOT 自动提醒时间点，树脂量可设置多个\n" +
			"如: 60 90 120 160，数字间用空格隔开"
};

export default <PluginSetting>{
	pluginName: "genshin",
	cfgList: [
		bind, today, abyss, mysQuery, getArtifact, character,
		wish, daily, alias, uidQuery, impArtifact, choosePool,
		slip, guide, domain, almanac, information,
		privateNowNote, privateNoteEvent, privateSubList,
		privateConfirm, privateSubscribe, privateCancel
	]
};