import { RenderRoutes } from "@/types/render";
import { PluginSetting } from "@/modules/plugin";

declare global {
	var __ADACHI_ROUTES__: Array<RenderRoutes>;
	function definePlugin<config extends PluginSetting>(config: config): config;
}

export {}