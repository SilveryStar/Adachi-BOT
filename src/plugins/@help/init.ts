import { PluginSetting } from "@modules/plugin";
import { OrderConfig } from "@modules/command";

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
	desc: [ "指令详细", "[编号]" ],
	headers: [ "detail" ],
	regexps: [ "\\d+" ],
	main: "achieves/detail",
	display: false
}

export async function init(): Promise<PluginSetting> {
	return {
		pluginName: "@help",
		cfgList: [ help, detail ]
	};
}