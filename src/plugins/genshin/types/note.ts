/**
 * @interface
 * 实时便笺数据
 * @currentResin 当前树脂
 * @maxResin 最大树脂
 * @resinRecoveryTime 树脂回复时间
 * @finishedTaskNum 完成每日委托数量
 * @totalTaskNum 每日委托总数
 * @isExtraTaskRewardReceived 是否领取每日委托奖励
 * @remainResinDiscountNum 剩余周本树脂减免次数
 * @resinDiscountNumLimit 周本树脂减免次数上限
 * @currentExpeditionNum 当前探索派遣数量
 * @maxExpeditionNum 最大探索派遣数量
 * @homeCoinRecoveryTime 洞天宝钱回复时间
 * @currentHomeCoin 当前洞天宝钱
 * @maxHomeCoin 最大洞天宝钱
 * @transformer 质量参变仪数据
 * */
export interface Note {
	type: "note";
	currentResin: number;
	maxResin: number;
	resinRecoveryTime: string;
	finishedTaskNum: number;
	totalTaskNum: number;
	isExtraTaskRewardReceived: boolean;
	remainResinDiscountNum: number;
	resinDiscountNumLimit: number;
	currentExpeditionNum: number;
	maxExpeditionNum: number;
	homeCoinRecoveryTime: string;
	currentHomeCoin: number;
	maxHomeCoin: number;
	expeditions: Expedition[];
	transformer: Transformer;
}

/**
 * @interface
 * 质量参变仪数据
 * @latestJobId 未知
 * @noticed 未知
 * @obtained 是否持有参变仪
 * @recoveryTime 剩余时间
 * @wiki 参变仪介绍地址
 * */
export interface Transformer {
	latestJobId: string;
	noticed: boolean;
	obtained: boolean;
	recoveryTime: {
		day: number;
		hour: number;
		minute: number;
		second: number;
		reached: boolean;
	}
	wiki: string;
}

/**
 * @interface
 * 探索派遣数据
 * @avatarSideIcon 角色头像
 * @status 探索派遣状态
 * @remainedTime 剩余时间
 * */
export interface Expedition {
	avatarSideIcon: string;
	status: "Ongoing" | "Finished";
	remainedTime: string;
}