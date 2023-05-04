export interface WishOverview {
	beginTime: string;
	endTime: string;
	gachaId: string;
	gachaName: string;
	gachaType: number;
}

export interface WishList {
	list: WishOverview[];
}

export interface WishProbItem {
	isUp: number;
	itemId: number;
	itemName: string;
	itemType: string;
	orderValue: number;
	rank: number;
}

export interface WishUpItem {
	itemAttr: string;
	itemColor: string;
	itemId: number,
	itemImg: string;
	itemName: string;
	itemType: string;
	itemTypeCn: string;
}

export interface WishDetail {
	banner: string,
	content: string;
	dateRange: string,
	gachaType: number;
	r3BaodiProb: string;
	r3Prob: string;
	r3ProbList: WishProbItem[];
	r4BaodiProb: string;
	r4Prob: string;
	r4ProbList: WishProbItem[];
	r4UpItems: WishUpItem[] | null;
	r4UpProb: string;
	r5BaodiProb: string;
	r5Prob: string;
	r5ProbList: WishProbItem[];
	r5UpItems: WishUpItem[] | null;
	r5UpProb: string;
	title: string;
}