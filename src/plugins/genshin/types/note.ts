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
	expeditions: Expedition[];
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