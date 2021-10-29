import { createFolder, createYAML, exists, loadYAML } from "../../../utils/config";
import { resolve } from "path";
import { ROOTPATH } from "../../../../app";
import { getAlmanacText } from "../utils/api";

export interface FortuneData {
	name: string;
	desc: string[];
}

export interface FortuneUnit {
	name: string;
	desc: string;
}

type AlmanacType = "auspicious" | "inauspicious";

export class AlmanacClass {
	private auspicious: FortuneData[] = [];
	private inauspicious: FortuneData[] = [];
	
	constructor() {
		const dataDir: string = "src/plugins/genshin/data";
		const ymlPath: string = resolve( ROOTPATH, dataDir, "almanac.yml" );
		createFolder( dataDir );
		
		if ( !exists( ymlPath ) ) {
			getAlmanacText().then( res => {
				this.auspicious = res.auspicious;
				this.inauspicious = res.inauspicious;
				createYAML( ymlPath, res, false );
			} );
		} else {
			const res: Record<string, FortuneData[]> = loadYAML( ymlPath, false );
			this.auspicious = res.auspicious;
			this.inauspicious = res.inauspicious;
		}
	}
	
	private static getDailyNumber(): number {
		const d: Date = new Date();
		const day: number = d.getDate() - ( d.getHours() < 4 ? 1 : 0 );
		
		return d.getFullYear() * ( d.getMonth() + 1 ) * day +
			   d.getFullYear() * ( d.getMonth() + 1 ) +
			   d.getFullYear() * day +
								 ( d.getMonth() + 1 ) * day;
	}
	
	private static getDirection(): string {
		const num: number = AlmanacClass.getDailyNumber();
		const arr: string[] = [ "正东", "正西", "正南", "正北", "东北", "西北", "东南", "西南" ];
		return arr[num % arr.length];
	}
	
	/* 计算方法来自 可莉特调 https://genshin.pub/ */
	private getUnits( type: AlmanacType ): FortuneUnit[] {
		const set: FortuneData[] = this[type];
		const length: number = set.length;
		
		let num: number = AlmanacClass.getDailyNumber();
		let mod: number = num % length;
		
		const list: number[] = [];
		while ( list.length < 3 && set[mod] ) {
			if (
				list.indexOf( mod ) === -1 &&
				type === "auspicious" ||
				this.getUnits( "auspicious" )
					.findIndex( el => el.name === set[mod].name )
			) {
				list.push( mod );
			}
			num = Math.floor( num * 1.05 );
			mod = num % length;
		}
		
		let tmpID: number = 0;
		return list.map( el => {
			const name: string = set[el].name;
			const desc: string = set[el].desc[tmpID++ % set[el].desc.length];
			return { name, desc };
		} );
	}
	
	public get(): string {
		const res = {
			auspicious: this.getUnits( "auspicious" ),
			inauspicious: this.getUnits( "inauspicious" ),
			direction: AlmanacClass.getDirection()
		};
		
		return Buffer.from( JSON.stringify( res ) ).toString( "base64" );
	}
}