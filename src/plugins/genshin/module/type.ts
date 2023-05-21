import { scheduleJob } from "node-schedule";
import { OssArtifact } from "#/genshin/types/ossMeta";
import { getArtifact } from "#/genshin/utils/meta";
import { characterMap, weaponMap } from "#/genshin/init";

export interface CharacterList {
	[P: string]: {
		id: number;
		name: string;
		element: string;
		weaponType: string;
		rarity: number;
	}
}

export interface WeaponList {
	[P: string]: {
		id: number;
		name: string;
		type: string;
		rarity: number;
	}
}

export class TypeData {
	public weapon = this.getWeaponList();
	public character = this.getCharacterList();
	public artifact = this.formatArtifact();
	
	constructor() {
		
		scheduleJob( "0 0 0 * * *", async () => {
			this.weapon = this.getWeaponList();
			this.character = this.getCharacterList();
			this.artifact = this.formatArtifact();
		} );
	}
	
	private getCharacterList() {
		const list: Record<string, string> = {};
		Object.values( characterMap.map ).forEach( chara => {
			list[chara.name] = chara.element;
		} );
		return list;
	}
	
	private getWeaponList() {
		const list: Record<string, string> = {};
		Object.values( weaponMap.map ).forEach( weapon => {
			list[weapon.name] = weapon.type;
		} );
		return list;
	}
	
	private formatArtifact() {
		const result = getArtifact();
		return {
			...result,
			suits: {
				...result.suits,
				...Object.fromEntries( Object.values( result.suits ).map( art => {
					return [ art.name, art ];
				} ) )
			},
			suitNames: Object.values( result.suits ).map( suit => suit.name )
		}
	}
	
	public getNameList(): string[] {
		return [
			...Object.keys( this.weapon ),
			...Object.keys( this.character ),
			...this.artifact.suitNames
		];
	}
}