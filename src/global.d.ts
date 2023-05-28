import { PluginSetting, RenderRoutes } from "@/modules/plugin";

declare global {
	var __ADACHI_ROUTES__: Array<RenderRoutes>;
	var ADACHI_VERSION: string;
	function definePlugin<config extends PluginSetting>(config: config): config;
}

export {}