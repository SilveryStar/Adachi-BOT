/**
 * @interface
 * 公告列表接口数据
 * @list 公告列表
 * @total 总数
 * @t 最后更新时间戳（s）
 */
export interface CalendarList {
	type: "calendar-list";
	list: CalendarListData[];
	total: number;
	t: string;
}

/**
 * @interface
 * 公告列表
 * @list 公告数据列表
 * @type 公告类型id
 * @typeLabel 公告类型名称
 */
export interface CalendarListData {
	list: CalendarListItem[];
	type: number;
	typeLabel: string;
}

/**
 * @interface
 * 公告数据
 * @annId 公告id
 * @banner 头图地址
 * @endTime 结束日期（YYYY-MM-DD hh:mm:ss）
 * @startTime 开始日期（YYYY-MM-DD hh:mm:ss）
 * @subtitle 副标题
 * @title 标题
 * @type 公告类型id
 * @typeLabel 公告类型名称
 */
export interface CalendarListItem {
	annId: number;
	banner: string;
	endTime: string;
	startTime: string;
	subtitle: string;
	title: string;
	type: number;
	typeLabel: string;
}

/**
 * @interface
 * 公告列表接口（含公告正文）数据
 * @list 公告数据（含公告正文）列表
 * @total 总数
 */
export interface CalendarDetail {
	type: "calendar-detail";
	list: CalendarDetailItem[];
	total: number;
}

/**
 * @interface
 * 公告数据（含公告正文）
 * @annId 公告id
 * @banner 头图地址
 * @content 公告正文
 * @subtitle 副标题
 * @title 标题
 */
export interface CalendarDetailItem {
	annId: number;
	banner: string;
	content: string;
	subtitle: string;
	title: string;
}