import { AuthLevel } from "@modules/management/auth";
import { OrderConfig, SwitchConfig } from "@modules/command";
import { PluginSetting } from "@modules/plugin";

const manager: SwitchConfig = {
	type: "switch",
	mode: "divided",
	cmdKey: "adachi.manager",
	desc: [ "管理设置", "[qq]" ],
	header: "",
	regexp: [ "\\d+" ],
	onKey: "manager",
	offKey: "unmanaged",
	auth: AuthLevel.Master,
	main: "manager"
};

const ban: SwitchConfig = {
	type: "switch",
	mode: "divided",
	cmdKey: "adachi.ban",
	desc: [ "封禁用户", "[qq|群号]" ],
	header: "",
	regexp: [ "[ugUG]\\d+" ],
	onKey: "ban",
	offKey: "unban",
	auth: AuthLevel.Manager,
	main: "ban",
	detail: "qq和群号需使用标识符开头\n" +
			"qq的标识符为 u，群号为 g\n" +
			"例：u123456789 表示qq为 123456789 的用户"
};

const limit: SwitchConfig = {
	type: "switch",
	mode: "single",
	cmdKey: "adachi.limit",
	desc: [ "指令权限", "[qq|群号] [key] #{OPT}" ],
	header: "limit",
	onKey: "on",
	offKey: "off",
	regexp: [ "[ugUG]\\d+", "[.-\\w]+", "#{OPT}" ],
	auth: AuthLevel.Manager,
	main: "limit",
	detail: "qq和群号需使用标识符开头\n" +
			"qq的标识符为 u，群号为 g\n" +
			"例：g987654321 表示群号为 987654321 的群聊"
};

const interval: OrderConfig = {
	type: "order",
	cmdKey: "adachi.interval",
	desc: [ "操作冷却", "[qq|群号] [时间]" ],
	headers: [ "int" ],
	regexps: [ "[ugUG]\\d+", "\\d+" ],
	auth: AuthLevel.Manager,
	main: "interval",
	detail: "该命令用于设置群聊/私聊的指令操作触发间隔，时间的单位为毫秒\n" +
			"1秒=1000毫秒，不支持设置小数"
};

export async function init(): Promise<PluginSetting> {
	return {
		pluginName: "@management",
		cfgList: [ manager, ban, limit, interval ]
	}
}