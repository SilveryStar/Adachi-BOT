import { RenderRoutes } from "@/modules/plugin";

declare global {
	var __ADACHI_ROUTES__: Array<RenderRoutes>;
	var ADACHI_VERSION: string;
	
	interface Window {
		__ADACHI_ROUTES__: Array<RenderRoutes>;
		ADACHI_VERSION: string;
	}
}

export {}