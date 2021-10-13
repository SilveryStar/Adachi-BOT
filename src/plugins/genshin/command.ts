import { CommandType } from "../../modules/command";
import { AuthLevel } from "../../modules/auth";

const commands: CommandType[] = [ {
	commandType: "order",
	key: "silvery-star.bind",
	docs: [ "绑定", "<通行证>" ],
	headers: [ "bind" ],
	regexps: [ "[0-9]+" ],
	main: "achieves/bind"
}, {
	commandType: "order",
	key: "silvery-star.mys-query",
	docs: [ "查询", "[通行证|@]" ],
	headers: [ "mys" ],
	regexps: [
		[ "[0-9]*" ],
		[ "\\[CQ:at,qq=[0-9]+.*\\]" ]
	],
	main: "achieves/mys-query"
}, {
	commandType: "order",
	key: "silvery-star.uid-query",
	docs: [ "查询", "<UID>" ],
	headers: [ "uid" ],
	regexps: [ "[0-9]{9}" ],
	main: "achieves/uid-query"
}, {
	commandType: "order",
	key: "silvery-star.art",
	docs: [ "抽圣遗物", "[秘境ID]" ],
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
	docs: [ "切换卡池", "<角色|武器|常驻>" ],
	headers: [ "choose", "t" ],
	regexps: [ "(角色|武器|常驻)" ],
	main: "achieves/choose"
}, {
	commandType: "order",
	key: "silvery-star.character",
	docs: [ "角色信息", "<角色名>" ],
	headers: [ "char" ],
	regexps: [ "[0-9a-z\\u4e00-\\u9fa5]+" ],
	main: "achieves/character"
}, {
	commandType: "order",
	key: "silvery-star.information",
	docs: [ "信息", "<角色|武器名>" ],
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
	docs: [ "修改别名", "${OPT} <本名> <别名>" ],
	header: "alias",
	regexp: [ "${OPT}", "[\\u4e00-\\u9fa5]+", "[0-9a-z\\u4e00-\\u9fa5]+" ],
	main: "achieves/alias",
	authLimit: AuthLevel.Manager,
	onKeyword: "add",
	offKeyword: "remove"
}, {
	commandType: "order",
	key: "silvery-star.abyss",
	docs: [ "深渊查询", "[UID|@] [last]" ],
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
	docs: [ "材料订阅", "${OPT} <角色名|武器名|群号>" ],
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
	docs: [ "今日订阅", "" ],
	headers: [ "today" ],
	regexps: [],
	main: "achieves/today"
} ];

export default commands;