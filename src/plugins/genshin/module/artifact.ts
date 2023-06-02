import Database from "@/modules/database";
import { OssArtifact, OssDomain } from "#/genshin/types/ossMeta";
import { getArtifact, getDomain } from "#/genshin/utils/meta";
import { ArtifactRouter } from "#/genshin/types/artifact";
import { getRandomNumber } from "@/utils/random";

interface PairData {
	property: number;
	weight: number;
}

interface Property {
	entry: number;
	stage: number;
}

export class ArtClass {
	private static propertyName: string[] = [
		"生命值", "生命值", "防御力", "防御力",
		"元素充能效率", "元素精通", "攻击力", "攻击力",
		"暴击伤害", "暴击率", "治疗加成", "物理伤害加成",
		"风元素伤害加成", "冰元素伤害加成", "雷元素伤害加成",
		"岩元素伤害加成", "水元素伤害加成", "火元素伤害加成"
	]
	
	private static slotName: string[] = [
		"生之花", "死之羽", "时之沙", "空之杯", "理之冠"
	]
	
	/* type=0表示初始数据，type=1表示满级数据 */
	private static mainStatData( stat: number, type: number ): number {
		switch ( stat ) {
			case 0:
				return type === 0 ? 717 : 4780;     // 固定生命值
			case 1:
				return type === 0 ? 0.070 : 0.466;  // 生命值百分比
			case 3:
				return type === 0 ? 0.087 : 0.583;  // 防御力百分比
			case 4:
				return type === 0 ? 0.078 : 0.518;  // 元素充能效率
			case 5:
				return type === 0 ? 28 : 187;       // 元素精通
			case 6:
				return type === 0 ? 47 : 311;       // 固定攻击力
			case 7:
				return type === 0 ? 0.070 : 0.466;  // 攻击力百分比
			case 8:
				return type === 0 ? 0.093 : 0.622;  // 暴击伤害
			case 9:
				return type === 0 ? 0.047 : 0.311;  // 暴击率
			case 10:
				return type === 0 ? 0.054 : 0.359;  // 治疗加成
			case 11:
				return type === 0 ? 0.087 : 0.583;  // 物理伤害加成
			case 12:
				return type === 0 ? 0.070 : 0.466;  // 风元素伤害加成
			case 13:
				return type === 0 ? 0.070 : 0.466;  // 冰元素伤害加成
			case 14:
				return type === 0 ? 0.070 : 0.466;  // 雷元素伤害加成
			case 15:
				return type === 0 ? 0.070 : 0.466;  // 岩元素伤害加成
			case 16:
				return type === 0 ? 0.070 : 0.466;  // 水元素伤害加成
			case 17:
				return type === 0 ? 0.070 : 0.466;  // 火元素伤害加成
			default:
				return -1;
		}
	}
	
	private static getProperty( dataArr: number[] ): number {
		let sufSum: number[] = [];
		let sum: number = 0;
		const length: number = dataArr.length;
		
		for ( let w of dataArr ) {
			sufSum.push( sum += w );
		}
		const rand: number = getRandomNumber( 1, sum );
		for ( let i = 0; i < length; i++ ) {
			if ( rand <= sufSum[i] ) {
				return i;
			}
		}
		return -1;
	}
	
	private weights: any;
	private suits: OssArtifact["suits"] = {};
	private domains: OssDomain = getDomain();
	private values: number[][] = [];
	
	constructor() {
		const data = getArtifact();
		this.suits = data.suits;
		this.weights = data.data.weights;
		this.values = data.data.values;
	}
	
	private getID( domainID: number = -1 ): Promise<number | string> {
		return new Promise( ( resolve, reject ) => {
			if ( domainID === -1 ) {
				const artifactIds: string[] = Object.keys( this.suits );
				const domainNum: number = getRandomNumber( 0, artifactIds.length - 1 );
				resolve( Number.parseInt( artifactIds[domainNum] ) );
			} else if ( domainID < this.domains.length ) {
				resolve( this.domains[domainID].artifact[getRandomNumber( 0, 1 )] );
			} else {
				reject( "未知的秘境ID" );
			}
		} );
	}
	
	private getSlot(): number {
		return ArtClass.getProperty( this.weights.slot );
	}
	
	private getMainStat( slot: number ): number {
		return ArtClass.getProperty( this.weights.prob[slot].main );
	}
	
	private getSubStats( slot: number, mainStat: number ): Property[] {
		let subStats: Property[] = [];
		let pairs: PairData[] = [];
		const length: number = this.values[0].length;
		
		for ( let i = 0; i < length; i++ ) {
			const w: number = this.weights.prob[slot].sub[i] * getRandomNumber( 0, 1e5 );
			pairs.push( { property: i, weight: w } );
		}
		pairs.sort( ( x: PairData, y: PairData ) => {
			return y.weight - x.weight;
		} );
		for ( let i = 0, num = 0; i < length && num < 4; i++ ) {
			if ( pairs[i].property !== mainStat ) {
				subStats.push( {
					entry: pairs[i].property,
					stage: ArtClass.getProperty( this.weights.stage )
				} );
				num++;
			}
		}
		
		return subStats;
	}
	
	private getStartNum(): number {
		return ArtClass.getProperty( this.weights.number ) === 0 ? 4 : 3;
	}
	
	private getImproves(): any[] {
		let improves: any[] = [];
		for ( let i = 0; i < 5; i++ ) {
			improves.push( {
				place: getRandomNumber( 0, 3 ),
				stage: ArtClass.getProperty( this.weights.stage )
			} );
		}
		
		return improves;
	}
	
	private toString( num: number ): string {
		if ( num < 1 ) {
			return ( num * 100 ).toFixed( 1 ) + "%";
		} else {
			return Math.round( num ).toString();
		}
	}
	
	private getResult(
		id: number, slot: number, started: number,
		main: number, sub: Property[], improves: any[]
	): ArtifactRouter[] {
		const par: ArtifactRouter = {
			name: this.suits[id].suit[slot],
			icon: slot.toString(),
			shirt: this.suits[id].name,
			slot: ArtClass.slotName[slot],
			mainStat: {
				name: ArtClass.propertyName[main],
				value: 0
			},
			subStats: [],
			level: -1
		};
		
		const initArt: ArtifactRouter = JSON.parse( JSON.stringify( par ) );
		initArt.level = 0;
		initArt.mainStat.value = this.toString( ArtClass.mainStatData( main, 0 ) );
		for ( let i = 0; i < started; i++ ) {
			const key: number = sub[i].entry;
			const stg: number = sub[i].stage;
			initArt.subStats.push( {
				name: ArtClass.propertyName[key],
				value: this.toString( this.values[stg][key] )
			} );
		}
		
		const reinArt: ArtifactRouter = JSON.parse( JSON.stringify( par ) );
		reinArt.level = 20;
		reinArt.mainStat.value = this.toString( ArtClass.mainStatData( main, 1 ) );
		for ( let i = 0; i < 4; i++ ) {
			const key: number = sub[i].entry;
			const stg: number = sub[i].stage;
			reinArt.subStats.push( {
				name: key.toString(),
				value: this.values[stg][key]
			} );
		}
		for ( let i = 0; i < started + 1; i++ ) {
			const plz: number = improves[i].place;
			const stg: number = improves[i].stage;
			const key: number = parseInt( reinArt.subStats[plz].name );
			// @ts-ignore
			reinArt.subStats[plz].value += this.values[stg][key];
		}
		for ( let i = 0; i < 4; i++ ) {
			const id: number = parseInt( reinArt.subStats[i].name );
			reinArt.subStats[i].name = ArtClass.propertyName[id];
			reinArt.subStats[i].value = this.toString( <number>reinArt.subStats[i].value );
		}
		
		return [ initArt, reinArt ];
	}
	
	public async get( userID: number, domain: number, redis: Database ): Promise<string> {
		let flag: string = "";
		try {
			const artifactID = <number>await this.getID( domain );
			const slot: number = this.getSlot();
			const mainStat: number = this.getMainStat( slot );
			const subStats: Property[] = this.getSubStats( slot, mainStat );
			const started: number = this.getStartNum();
			const improves: any[] = this.getImproves();
			
			const [ initProp, reinProp ] = this.getResult(
				artifactID, slot, started, mainStat, subStats, improves
			);
			
			await redis.setString(
				`silvery-star.artifact-${ userID }`,
				JSON.stringify( { initProp, reinProp } )
			);
		} catch ( reason: any ) {
			flag = reason;
		}
		return flag;
	}
	
	public domainInfo(): string {
		return this.domains.map( ( domain, index ) => {
			return `${ index + 1 }. ${ domain.name }`
		} ).join( "\n" );
	}
}