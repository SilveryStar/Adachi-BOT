/**
 * @interface
 * 米游社养成计算器数据
 * @skillList 技能列表
 * @weapon 武器
 * @reliquaryList 圣遗物列表
 * */
export interface AvatarDetailRaw {
	type: "avatar";
	skillList: AvatarSkill[];
	weapon: AvatarWeapon;
	reliquaryList: AvatarReliquary[];
}

/**
 * @interface
 * 技能详细
 * @name. 技能名
 * @icon 技能图标
 * @maxLevel 最大等级
 * @levelCurrent 当前等级
 * */
export interface AvatarSkill {
	id: number;
	groupId: number;
	name: string;
	icon: string;
	maxLevel: number;
	levelCurrent: number;
}

/**
 * @interface
 * 武器详细
 * */
export interface AvatarWeapon {
	id: number;
	name: string;
	icon: string;
	weaponCatID: number;
	weaponLevel: number;
	maxLevel: number;
	levelCurrent: number;
}

/**
 * @interface
 * 圣遗物详细
 * */
export interface AvatarReliquary {
	id: number;
	name: string;
	icon: string;
	reliquaryCatID: number;
	reliquaryLevel: number;
	maxLevel: number;
	levelCurrent: number;
}

export type Skills = Array<Pick<AvatarSkill, "name" | "icon" | "levelCurrent">>;