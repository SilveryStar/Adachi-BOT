export interface SignInInfo {
	type: "sign-in-info";
	totalSignDay: number;
	today: string;
	isSign: boolean;
	isSub: boolean;
	firstBind: boolean;
	monthFirst: boolean;
	signCountMissed: boolean;
}

export interface SignInResult {
	type: "sign-in-result";
	code: string;
}