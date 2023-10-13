export interface DayData {
	dayID: string;
	data: { hour: string, detail: string }[];
}

export interface WeekData {
	week: number;
	data: DayData;
}