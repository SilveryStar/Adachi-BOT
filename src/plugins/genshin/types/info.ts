export type InfoFullResponse = InfoResponse | ArtifactInfo;

export type InfoResponse = WeaponInfo | CharacterInfo;

/**
 * @interface
 * 圣遗物信息数据
 * @name 名称
 * @icon 默认图标为几号位
 * @id id
 * @levelList 可出现等级列表
 * @
 */
export interface ArtifactInfo {
	"type": "圣遗物";
	"id": number;
	"name": string;
	"icon": number;
	"levelList": number[];
	"access": string[];
	"effects": {
		[P in 1 | 2 | 4]: string;
	};
	suit: {
		[P in 0 | 1 | 2 | 3 | 4]: {
			name: string;
			description: string;
		}
	}
}

/**
 * @interface
 * 武器信息数据
 * @id 角色 ID
 * @name 武器名
 * @weaponType 武器类型
 * @fetter.access 武器获取方式
 * @fetter.introduce 武器介绍
 * @rarity 稀有度
 * @props 武器属性（各等级）
 * @updateCost.ascensionMaterials 突破材料
 * @updateCost.coins 摩拉花费
 * @time 材料获取时间
 * @skill.name 武器技能名
 * @skill.content 武器技能描述
 * */
export interface WeaponInfo {
	type: "武器";
	id: number;
	name: string;
	weaponType: {
		id: string;
		label: string;
	};
	fetter: {
		access: string;
		introduce: string;
	}
	rarity: number;
	props: Record<string, InfoProps<"weapon">>
	updateCost: {
		ascensionMaterials: InfoMaterial[];
		coins: number;
	}
	time: number[];
	skill: {
		name: string;
		content: string;
	} | null
}

/**
 * @interface
 * 角色信息数据
 * @title 角色外号
 * @id 角色 ID
 * @rarity 稀有度
 * @weapon 武器种类
 * @name 角色名
 * @birthday 角色生日
 * @element 角色神之眼类型
 * @fetter 角色来历相关
 * @cv 角色配音演员
 * @props 人物属性（各等级）
 * @ascensionMaterials 突破材料
 * @talentMaterials 天赋培养材料
 * @time 材料获取时间
 * @skill 普通攻击/元素战技/元素爆发
 * @talents 固有天赋
 * @constellations 命之座
 * */
export interface CharacterInfo {
	type: "角色";
	id: number;
	rarity: number;
	weapon: {
		id: string;
		label: string;
	}
	name: string;
	birthday: [ number, number ];
	element: {
		id: string;
		label: string;
	};
	fetter: {
		title: string;
		native: string;
		constellation: string;
		introduce: string
	}
	cv: {
		CHS: string;
		EN: string;
		JP: string;
		KR: string;
	};
	props: Record<string, InfoProps<"avatar">>
	updateCost: {
		ascensionMaterials: InfoMaterial[];
		talentMaterials: InfoMaterial[];
		coins: number;
	}
	time: number[];
	skills: InfoTalent[];
	talents: InfoTalent[];
	constellations: InfoTalent[];
}

interface BaseProps {
	baseATK: number;
	baseHP: number;
	baseDEF: number;
	extraProp?: {
		name: string;
		value: string;
	}
}

/**
 * @interface
 * 角色武器属性
 */
export type InfoProps<T extends "avatar" | "weapon"> = T extends "avatar" ? BaseProps : Omit<BaseProps, "baseHP" | "baseDEF">;

export interface InfoMaterial {
	name: string;
	rank: number;
	count: number;
}

export interface InfoTalent {
	icon: string;
	name: string;
	desc: string;
}