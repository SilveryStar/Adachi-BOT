export interface SignInInfo {
	totalSignDay: number;
	today: string;
	isSign: boolean;
	isSub: boolean;
	firstBind: boolean;
	monthFirst: boolean;
	signCountMissed: boolean;
}

export interface SignInResult {
	code: string;
	riskCode: number;
	gt: string;
	challenge: string;
	success: number;
}