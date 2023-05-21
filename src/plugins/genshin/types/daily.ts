import { InfoResponse } from "#/genshin/types/info";

export interface DailyRouter {
	character: Record<string, DailyMaterialInfo>;
	weapon: Record<string, DailyMaterialInfo>;
	event: Array<DailyEvent>;
}

export interface DailyMaterialInfo {
	name: string;
	rank: number;
	units: InfoResponse[];
}

export interface DailyEvent {
	title: string;
	subTitle: string;
	banner: string;
	startTime: number;
	endTime: number;
}