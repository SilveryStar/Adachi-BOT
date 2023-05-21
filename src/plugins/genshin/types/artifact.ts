export interface ArtProp {
	name: string;
	value: number | string;
}

export interface ArtifactRouter {
	name: string;
	icon: string;
	shirt: string;
	slot: string;
	mainStat: ArtProp;
	subStats: ArtProp[];
	level: number;
}