export interface OssArtifact {
	data: {
		weights: {
			slot: number[];
			prob: Array<{
				main: number[];
				sub: number[];
			}>;
			stage: number[];
			number: number[];
		},
		values: number[][];
	},
	suits: Record<string, {
		id: number;
		name: string;
		levelList: number[];
		suit: string[];
	}>;
}

export interface DailyMaterial {
	"Mon&Thu": string[];
	"Tue&Fri": string[];
	"Wed&Sat": string[];
}

export type OssDomain = Array<{
	id: number;
	name: string;
	artifact: number[];
	description: string
}>;