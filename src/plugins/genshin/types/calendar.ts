/**
 * @interface
 * 公告列表接口数据
 * @list 公告列表
 * @total 总数
 * @t 最后更新时间戳（s）
 */
export interface CalendarList {
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


/**
 * @interface
 * 公告最终存储数据
 * @banner 头图地址
 * @title 标题
 * @subtitle 副标题
 * @startTime 起始时间
 * @endTime 结束时间
 */
export interface CalendarData {
	banner: string;
	title: string;
	subTitle: string;
	startTime: number;
	endTime: number;
}