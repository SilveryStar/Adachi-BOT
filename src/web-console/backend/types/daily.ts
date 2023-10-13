import { CharacterInfo, WeaponInfo } from "#/genshin/types";

export interface DailyInfo<T extends "character" | "weapon"> {
	[P: string]: {
		name: string;
		rank: number;
		units: T extends "character" ? CharacterInfo[] : WeaponInfo[];
	}
}