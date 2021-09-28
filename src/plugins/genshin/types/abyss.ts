/**
 * @interface
 * 深渊查询数据
 * @scheduleId 深渊期数
 * @startTime 本期开始时间
 * @endTime 本期截止时间
 * @totalBattleTimes 挑战次数
 * @totalWinTimes 获胜次数
 * @totalStar 总获取渊星数
 * @maxFloor 最深抵达
 * @revealRank 出战次数
 * @defeatRank 敌人击破数
 * @damageRank 最强一击
 * @takeDamageRank 承受伤害
 * @normalSkillRank 元素战技次数
 * @energySkillRank 元素爆发次数
 * @floors 层挑战次数
 * @isUnlock 是否解锁
 * */
export interface Abyss {
	type: "abyss";
	scheduleId: number;
	startTime: string;
	endTime: string;
	totalBattleTimes: number;
	totalWinTimes: number;
	totalStar: number
	maxFloor: string;
	revealRank: AbyssCharacter[];
	defeatRank: AbyssCharacter[];
	damageRank: AbyssCharacter[];
	takeDamageRank: AbyssCharacter[];
	normalSkillRank: AbyssCharacter[];
	energySkillRank: AbyssCharacter[];
	floors: AbyssFloor[];
	isUnlock: boolean;
}

/**
 * @interface
 * 深渊挑战「层」数据
 * @index 层数
 * @icon 空，含义不明
 * @star 获取渊星数量
 * @maxStar 最大渊星数量
 * @settleTime 值为 “0”，含义不明
 * @levels 间挑战数据
 * @isUnlock 是否解锁
 * */
interface AbyssFloor {
	index: number;
	icon: string;
	star: number;
	maxStar: number;
	settleTime: string;
	levels: AbyssRoom[];
	isUnlock: boolean;
}

/**
 * @interface
 * 深渊挑战「间」数据
 * @index 间数
 * @star 获取渊星数量
 * @maxStar 最大渊星数量
 * @battles 上/下间数据
 * */
interface AbyssRoom {
	index: number;
	star: number;
	maxStar: number;
	battles: AbyssBattle[];
}

/**
 * @interface
 * 深渊挑战上/下间数据
 * @index 1/2 表示上/下间，1~4 层均为 1
 * @timestamp 时间戳(s)
 * @avatars 参战角色数据
 * */
interface AbyssBattle {
	index: number;
	timestamp: string;
	avatars: {
		id: number;
		icon: string;
		level: number;
		rarity: number;
	}[];
}

/**
 * @interface
 * 深渊角色数据
 * @avatarId 角色ID
 * @avatarIcon 角色头像
 * @value 数据值
 * @rarity 角色稀有度
 * */
interface AbyssCharacter {
	avatarId: number;
	avatarIcon: string;
	value: number;
	rarity: number;
}