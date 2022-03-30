/**
 * @interface
 * 旅行者札记数据
 * @accountId 米游社通行证ID
 * @dataLastMonth 上个月份
 * @dataMonth 当前月份
 * @date 查询日期
 * @dayData 当日数据
 * @month 放弃月份
 * @optionalMonth 可查询月份
 * @monthData 当月数据
 * @nickname 游戏内昵称
 * @region 服务器代号
 * */
export interface Ledger {
	type: "ledger";
	accountId: number;
	dataLastMonth: number;
	dataMonth: number;
	date: string;
	dayData: LedgerDetail;
	lantern: boolean;
	month: number;
	optionalMonth: number[];
	monthData: {
		groupBy: PrimogemsGroup[];
		currentPrimogemsLevel: number;
		moraRate: number;
		primogemsRate: number;
	} & LedgerDetail;
	nickname: string;
	region: string;
	uid: number;
}

/**
 * @interface
 * 具体数据
 * @currentPrimogems 当日/月获取原石数量
 * @currentMora 当日/月获取摩拉数量
 * @lastPrimogems 上日/月获取原石数量
 * @lastMora 上日/月获取摩拉数量
 * */
export interface LedgerDetail {
	currentPrimogems: number;
	currentMora: number;
	lastPrimogems: number;
	lastMora: number;
}

/**
 * @interface
 * 原石获取来源
 * @actionId 来源ID
 * @action 来源
 * @num 获取数量
 * @percent 该来源占比
 * */
export interface PrimogemsGroup {
	actionId: number;
	action: string;
	num: number;
	percent: number;
}