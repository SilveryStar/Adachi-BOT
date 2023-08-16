import { AuthLevel } from "@/modules/management/auth";
import { OrderConfig, SwitchConfig } from "@/modules/command";
import { definePlugin } from "@/modules/plugin";

const manager: SwitchConfig = {
	type: "switch",
	mode: "divided",
	cmdKey: "adachi.manager",
	desc: [ "管理设置", "[qq]" ],
	header: "",
	regexps: [ "\\d+" ],
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
	regexps: [ `[ugUG]\\d+` ],
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
	regexps: [ "[ugUG]\\d+", "[.-\\w]+", "#{OPT}" ],
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

const refresh: OrderConfig = {
	type: "order",
	cmdKey: "adachi.hot-update-config",
	desc: [ "刷新配置", "" ],
	headers: [ "refresh" ],
	regexps: [],
	auth: AuthLevel.Master,
	main: "refresh",
	detail: "该指令用于重新加载在 /config 目录中的部分配置文件（setting 不会重新加载）"
}

const upgrade: OrderConfig = {
	type: "order",
	cmdKey: "adachi.hot-upgrade",
	desc: [ "更新bot", "(-f)" ],
	headers: [ "upgrade" ],
	regexps: [ "(-f)?" ],
	auth: AuthLevel.Master,
	main: "upgrade",
	detail: "该指令用于检测并更新 bot 源码\n" +
		"要求项目必须是通过 git clone 下载的且不能为 win-start 启动\n" +
		"若存在更新则会更新并重启 bot\n" +
		"在指令后追加 -f 来覆盖本地修改强制更新"
}

const restart: OrderConfig = {
	type: "order",
	cmdKey: "adachi.restart",
	desc: [ "重启bot", "" ],
	headers: [ "restart" ],
	regexps: [],
	auth: AuthLevel.Master,
	main: "restart",
	detail: "用于重启 bot，使用win-start方式启动服务无法使用该指令"
}

const reload: OrderConfig = {
	type: "order",
	cmdKey: "adachi.reload",
	desc: [ "重载插件", "(插件名)" ],
	headers: [ "reload" ],
	regexps: [ "([\u4E00-\u9FA5\\w\\-]+)?" ],
	auth: AuthLevel.Master,
	main: "reload",
	detail: "用于重新加载插件源码\n" +
		"不指定插件名将对全部插件进行重载"
}

const upgrade_plugins: OrderConfig = {
	type: "order",
	cmdKey: "adachi.hot-upgrade-plugins",
	desc: [ "更新插件", "(-f) (-s) (插件名)" ],
	headers: [ "upgrade_plugins" ],
	regexps: [ "(-f)?", "(-s)?", "([\u4E00-\u9FA5\\w\\-]+)?" ],
	auth: AuthLevel.Master,
	main: "upgrade-plugins",
	detail: "该指令用于检测并更新 bot plugin 源码\n" +
		"要求项目必须是通过 git clone 下载的且不能为 win-start 启动\n" +
		"若存在更新则会更新插件并重启 bot\n" +
		"在指令后追加 -f 来覆盖本地修改强制更新\n" +
		"在指令后追加 -s 将不会自动重启 BOT \n" +
		"不指定插件名将更新全部支持热更新的插件"
}

export default definePlugin( {
	name: "management",
	cfgList: [
		manager, ban, limit, interval,
		refresh, upgrade, restart, reload, upgrade_plugins
	]
} );