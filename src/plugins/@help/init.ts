import { PluginSetting } from "@/modules/plugin";
import { OrderConfig } from "@/modules/command";
import { Renderer } from "@/modules/renderer";
import { BOT } from "@/main";
import * as r from "./routes";
import { Router } from "express";

const help: OrderConfig = {
	type: "order",
	cmdKey: "adachi.help",
	desc: [ "帮助", "(-k)" ],
	headers: [ "help" ],
	regexps: [ "(-k)?" ],
	main: "achieves/help",
	detail: "追加 -k 来查看指令 key 值"
};

const detail: OrderConfig = {
	type: "order",
	cmdKey: "adachi.detail",
	desc: [ "指令详细", "[序号]" ],
	headers: [ "detail" ],
	regexps: [ "\\d+" ],
	main: "achieves/detail",
	display: false
};

const call: OrderConfig = {
	type: "order",
	cmdKey: "adachi.call",
	desc: [ "联系bot持有者", "[内容]" ],
	headers: [ "call" ],
	regexps: [ "[\\W\\w]+" ],
	scope: 2,
	ignoreCase: false,
	main: "achieves/call",
	detail: "向 bot 持有者反馈信息\n" +
			"仅允许发送包含文字/图片的内容"
};

const serverRouters: Record<string, Router> = {
	"/api/help": r.HelpRoute
}

export let renderer: Renderer;

export async function init( bot: BOT ): Promise<PluginSetting> {
	/* 未启用卡片帮助时不启动服务 */
	if ( bot.config.helpMessageStyle === "card" ) {
		/* 实例化渲染器 */
		renderer = bot.renderer.register("/@help", "#app" );
	}
	
	return {
		pluginName: "@help",
		cfgList: [ help, detail, call ],
		renderer: true,
		server: {
			routers: serverRouters
		}
	};
}