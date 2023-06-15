import { RenderRoutes } from "@/modules/plugin";

declare global {
	var __ADACHI_ROUTES__: Array<RenderRoutes>;
	
	interface Window {
		__ADACHI_ROUTES__: Array<RenderRoutes>;
		ADACHI_VERSION: string;
	}
}

export {}