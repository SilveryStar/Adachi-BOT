/**
 * @interface
 * 玩家游戏内数据
 * @role
 * @avatars 角色列表
 * @stats 数据统计
 * @cityExplorations 疑似弃用，无内容
 * @worldExplorations 世界探索
 * @homes 尘歌壶
 * */
export interface UserInfo {
	type: "user-info";
	role: null;
	avatars: Character[];
	stats: Stats;
	cityExplorations: [] | any;
	worldExplorations: Exploration[];
	homes: Home[];
}

/**
 * @interface
 * @id 角色 ID
 * @image 角色图片
 * @name. 角色名
 * @element 元素
 * @fetter 好感度
 * @level 角色等级
 * @rarity 角色稀有度
 * @activedConstellationNum 激活命之座
 * */
interface Character {
	id: number;
	image: string;
	name: string;
	element: string;
	fetter: number;
	level: number;
	rarity: number;
	activedConstellationNum: number;
}

/**
 * @interface
 * 数据统计
 * @activeDayNumber 活跃天数
 * @achievementNumber 成就数
 * @winRate 未知
 * @anemoculusNumber 风神瞳数
 * @geoculusNumber 岩神瞳数
 * @avatarNumber 角色数
 * @wayPointNumber 锚点解锁数
 * @domainNumber 秘境解锁数
 * @spiralAbyss 深渊战绩
 * @preciousChestNumber 珍贵宝箱数
 * @luxuriousChestNumber 华丽宝箱数
 * @exquisiteChestNumber 精致宝箱数
 * @commonChestNumber 普通宝箱数
 * @magicChestNumber 奇馈宝箱
 * @electroculusNumber 雷神瞳数
 * */
interface Stats {
	activeDayNumber: number;
	achievementNumber: number;
	winRate: number;
	anemoculusNumber: number;
	geoculusNumber: number;
	avatarNumber: number
	wayPointNumber: number;
	domainNumber: number
	spiralAbyss: string;
	preciousChestNumber: number;
	luxuriousChestNumber: number;
	exquisiteChestNumber: number;
	commonChestNumber: number;
	magicChestNumber: number;
	electroculusNumber: number;
}

/**
 * @interface
 * 世界探索
 * @level 声望/供奉等级
 * @explorationPercentage 探索度
 * @icon 地区图标
 * @name. 地区名
 * @type. 声望 | 供奉
 * @offerings 地区供奉
 * @id 地区 ID
 * */
interface Exploration {
	level: number;
	explorationPercentage: number;
	icon: string;
	name: string;
	type: "Reputation" | "Offering";
	offerings: Offering[];
	id: number;
}

/**
 * @interface
 * 地区供奉
 * @name. 供奉名
 * @level 供奉等级
 * */
interface Offering {
	name: string;
	level: number;
}

/**
 * @interface
 * 尘歌壶数据
 * @level 信任等级
 * @visitNum 访客数量
 * @comfortNum 舒适度
 * @itemNum 物品数量
 * @name. 场景名称
 * @icon 场景图片
 * @comfortLevelName 信任等级名
 * @comfortLevelIcon 信任等级图标
 * */
interface Home {
	level: number;
	visitNum: number;
	comfortNum: number;
	itemNum: number;
	name: string;
	icon: string;
	comfortLevelName: string;
	comfortLevelIcon: string;
}