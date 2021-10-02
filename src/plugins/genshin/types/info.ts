export type InfoResponse = WeaponInfo | CharacterInfo;

/**
 * @interface
 * 武器信息数据
 * @title 武器类型
 * @name. 武器名
 * @introduce 武器介绍
 * @access 武器获取方式
 * @rarity 稀有度
 * @mainStat 主词条属性
 * @mainValue 主词条数值
 * @baseATK 最大基础攻击力
 * @ascensionMaterials 突破材料
 * @time 材料获取时间
 * @skillName 武器技能名
 * @skillContent 武器技能描述
 * */
export interface WeaponInfo {
	type: "武器";
	title: "弓" | "长柄武器" | "单手剑" | "双手剑" | "法器";
	name: string;
	introduce: string;
	access: string;
	rarity: number;
	mainStat: string;
	mainValue: string;
	baseATK: number;
	ascensionMaterials: string[][];
	time: string;
	skillName: string;
	skillContent: string;
}

/**
 * @interface
 * 角色信息数据
 * @title 角色外号
 * @id 角色 ID
 * @name. 角色名
 * @introduce 角色介绍
 * @birthday 角色生日
 * @element 角色神之眼属性
 * @cv 角色配音演员
 * @constellationName 命之座名称
 * @rarity 稀有度
 * @mainStat 突破属性
 * @mainValue 突破属性数值
 * @baseATK 最大基础攻击力
 * @ascensionMaterials 突破材料
 * @levelUpMaterials 升级材料
 * @talentMaterials 天赋培养材料
 * @time 材料获取时间
 * @constellations 命之座描述
 * */
export interface CharacterInfo {
	type: "角色";
	title: string;
	id: number;
	name: string;
	introduce: string;
	birthday: string;
	element: string;
	cv: string;
	constellationName: string;
	rarity: number;
	mainStat: string;
	mainValue: string;
	baseATK: number;
	ascensionMaterials: string[];
	levelUpMaterials: string[];
	talentMaterials: string[];
	time: string;
	constellations: string[];
}