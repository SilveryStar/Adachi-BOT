import { CommandType } from "../../modules/command";
import { AuthLevel } from "../../modules/auth";
import { MessageScope } from "../../modules/message";

const commands: CommandType[] = [ {
	commandType: "order",
	key: "silvery-star.bind",
	docs: [ "绑定", "[通行证]" ],
	headers: [ "bind" ],
	regexps: [ "[0-9]+" ],
	main: "achieves/bind"
}, {
	commandType: "order",
	key: "silvery-star.mys-query",
	docs: [ "查询", "(通行证|@)" ],
	headers: [ "mys" ],
	regexps: [
		[ "[0-9]*" ],
		[ "\\[CQ:at,qq=[0-9]+.*\\]" ]
	],
	main: "achieves/mys-query"
}, {
	commandType: "order",
	key: "silvery-star.uid-query",
	docs: [ "查询", "[UID]" ],
	headers: [ "uid" ],
	regexps: [ "[0-9]{9}" ],
	main: "achieves/uid-query"
}, {
	commandType: "order",
	key: "silvery-star.art",
	docs: [ "抽圣遗物", "(秘境ID)" ],
	headers: [ "art" ],
	regexps: [ "[0-9]*" ],
	main: "achieves/artifact"
}, {
	commandType: "order",
	key: "silvery-star.improve",
	docs: [ "强化", "" ],
	headers: [ "imp" ],
	regexps: [],
	main: "achieves/improve"
}, {
	commandType: "order",
	key: "silvery-star.dom",
	docs: [ "秘境查询", "" ],
	headers: [ "dom" ],
	regexps: [],
	main: "achieves/domain"
}, {
	commandType: "order",
	key: "silvery-star.wish",
	docs: [ "抽卡", "" ],
	headers: [ "wish", "w" ],
	regexps: [],
	main: "achieves/wish"
}, {
	commandType: "order",
	key: "silvery-star.choose",
	docs: [ "切换卡池", "[角色|武器|常驻]" ],
	headers: [ "choose", "t" ],
	regexps: [ "(角色|武器|常驻)" ],
	main: "achieves/choose"
}, {
	commandType: "order",
	key: "silvery-star.character",
	docs: [ "角色信息", "[角色名]" ],
	headers: [ "char" ],
	regexps: [ "[0-9a-z\\u4e00-\\u9fa5]+" ],
	main: "achieves/character"
}, {
	commandType: "order",
	key: "silvery-star.information",
	docs: [ "信息", "[角色|武器名]" ],
	headers: [ "info" ],
	regexps: [ "[0-9a-z\\u4e00-\\u9fa5]+" ],
	main: "achieves/info"
}, {
	commandType: "order",
	key: "by-ha.slip",
	docs: [ "御神签", "" ],
	headers: [ "s", "slip" ],
	regexps: [],
	main: "achieves/slip"
}, {
	commandType: "switch",
	mode: "single",
	key: "silvery-star.alias-customize",
	docs: [ "修改别名", "${OPT} [本名] [别名]" ],
	header: "alias",
	regexp: [ "${OPT}", "[\\u4e00-\\u9fa5]+", "[0-9a-z\\u4e00-\\u9fa5]+" ],
	main: "achieves/alias",
	authLimit: AuthLevel.Manager,
	onKeyword: "add",
	offKeyword: "remove"
}, {
	commandType: "order",
	key: "silvery-star.abyss",
	docs: [ "深渊查询", "(UID|@) (last)" ],
	headers: [ "aby" ],
	regexps: [
		[ "[0-9]*( last)?" ],
		[ "\\[CQ:at,qq=[0-9]+.*\\]( last)?"],
		[ "( last)?" ]
	],
	main: "achieves/abyss-query",
	detail: "在查询指令最后添加 last 将会返回上一期深渊的战绩"
}, {
	commandType: "switch",
	mode: "single",
	key: "silvery-star.daily",
	docs: [ "材料订阅", "${OPT} [角色|武器名|群号]" ],
	header: "sub",
	onKeyword: "add",
	offKeyword: "remove",
	regexp: [ "${OPT}", "[0-9a-z\\u4e00-\\u9fa5]+" ],
	main: "achieves/daily",
	detail: "为自己添加/删除角色天赋/武器的突破材料，每天的 6:00~7:00 随机时间进行推送\n" +
			"若使用群号，则将在 6:00 向该群发送所有角色天赋/武器的突破材料"
}, {
	commandType: "order",
	key: "silvery-star.today",
	docs: [ "今日素材", "" ],
	headers: [ "today" ],
	regexps: [],
	main: "achieves/today"
}, {
	commandType: "order",
	key: "silvery-star.private-subscribe",
	docs: [ "私人服务", "" ],
	headers: [ "ps" ],
	regexps: [],
	main: "achieves/private",
	scope: MessageScope.Private,
	detail: "私人服务，一类通过使用个人 cookie 获取私密信息\n" +
			"目前包含实时便笺订阅功能，未来可能会添加新功能"
}, {
	commandType: "order",
	key: "silvery-star.private-confirm",
	docs: [ "", "" ],
	headers: [ "confirm" ],
	regexps: [ ".+" ],
	display: false,
	main: "achieves/private",
	scope: MessageScope.Private
}, {
	commandType: "order",
	key: "silvery-star.private-list",
	docs: [ "私人服务列表", "" ],
	headers: [ "pl" ],
	regexps: [],
	main: "achieves/private",
	scope: MessageScope.Private
}, {
	commandType: "order",
	key: "silvery-star.cancel-private",
	docs: [ "取消私人服务", "[账户编号]" ],
	headers: [ "pr" ],
	regexps: [ "[0-9]+" ],
	main: "achieves/private",
	scope: MessageScope.Private,
	detail: "账户编号在私人服务列表中查看"
}, {
	commandType: "order",
	key: "silvery-star.now-note",
	docs: [ "实时便笺", "" ],
	headers: [ "note" ],
	regexps: [],
	main: "achieves/note"
}, {
	commandType: "order",
	key: "silvery-star.note-set-time",
	docs: [ "便笺提醒时间", "[账户编号] [树脂量]" ],
	headers: [ "nt" ],
	regexps: [ "[0-9 ]+" ],
	main: "achieves/note",
	scope: MessageScope.Private,
	detail: "用于设置 BOT 自动提醒时间点，树脂量可设置多个\n" +
			"如: 60 90 120 160，数字间用空格隔开"
}, {
	commandType: "order",
	key: "silvery-star.character-guide",
	docs: [ "西风驿站攻略", "[角色名]" ],
	headers: [ "guide" ],
	regexps: [ "[0-9a-z\\u4e00-\\u9fa5]+" ],
	main: "achieves/guide"
}, {
	commandType: "order",
	key: "silvery-star.almanac",
	docs: [ "原神黄历", "" ],
	headers: [ "alm" ],
	regexps: [],
	main: "achieves/almanac"
} ];

export default commands;