import { Router } from "express";

export interface RenderRoutes {
	path: string;
	componentData: {
		plugin: string;
		renderDir: string;
		fileDir?: string;
		fileName: string;
	};
}

export interface ServerRouters {
	path: string;
	router: Router;
}