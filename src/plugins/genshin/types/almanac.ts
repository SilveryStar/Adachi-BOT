export interface Almanac {
	auspicious: AlmanacItem[];
	inauspicious: AlmanacItem[];
	direction: string;
}

export interface AlmanacItem {
	desc: string;
	name: string;
}