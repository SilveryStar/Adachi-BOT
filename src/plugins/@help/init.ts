import { PluginSetting } from "@modules/plugin";
import { OrderConfig } from "@modules/command";
import { Renderer } from "@modules/renderer";
import { BOT } from "@modules/bot";
import { createServer } from "#@help/server";

const help: OrderConfig = {
	type: "order",
	cmdKey: "adachi.help",
	desc: [ "指令帮助", "(-k)" ],
	headers: [ "help" ],
	regexps: [ "(-k)?" ],
	main: "achieves/help"
};

const detail: OrderConfig = {
	type: "order",
	cmdKey: "adachi.detail",
	desc: [ "指令详细", "[序号]" ],
	headers: [ "detail" ],
	regexps: [ "\\d+" ],
	main: "achieves/detail",
	display: false
}

export let renderer: Renderer;

export async function init( bot: BOT ): Promise<PluginSetting> {
	/* 未启用卡片帮助时不启动服务 */
	if ( bot.config.helpMessageStyle === "card" ) {
		const serverPort: number = bot.config.helpPort;
		/* 实例化渲染器 */
		renderer = bot.renderer.register(
			"@help", "/view",
			serverPort, "#app"
		);
		/* 启动 express 服务 */
		createServer( serverPort, bot.logger );
	}
	
	return {
		pluginName: "@help",
		cfgList: [ help, detail ]
	};
}