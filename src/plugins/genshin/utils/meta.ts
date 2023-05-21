import { DailyMaterial, OssArtifact, OssDomain } from "#/genshin/types/ossMeta";
import bot from "ROOT";
import { SlipDetail } from "#/genshin/module/slip";
import { InfoResponse } from "#/genshin/types";
import { isJsonString } from "@/utils/common";
import { AliasMap } from "#/genshin/module/alias";
import { FortuneData } from "#/genshin/module/almanac";
import { CharacterList, WeaponList } from "#/genshin/module/type";

const basePath = "public/assets/genshin";
const getMetaData = ( filename: string ) => bot.file.loadYAML( `${ basePath }/meta/${ filename }`, "root" );

export function getDomain(): OssDomain {
	return <OssDomain>( getMetaData( "domain" ) || [] );
}

export function getArtifact(): OssArtifact {
	return <OssArtifact>( getMetaData( "artifact" ) || {
		// 圣遗物权值
		data: {
			weights: {
				/**
				 * 套装部位权值
				 * 生之花  死之羽  时之沙  空之杯  理之冠
				 */
				slot: [ 214, 214, 208, 182, 182 ],
				/**
				 * 属性权值
				 * HP   HP%  DEF  DEF% ER%  EM   ATK  ATK%  CD% CR% Phy% Ane% Cry% Ele% Geo% Hyd% Pyr% heal%
				 */
				prob: [ {
					// 副词条
					main: [ 108, 108, 108, 108, 104, 104, 102, 102, 78, 78, 0, 0, 0, 0, 0, 0, 0, 0 ],
					sub: [ 108, 108, 108, 108, 104, 104, 102, 102, 78, 78, 0, 0, 0, 0, 0, 0, 0, 0 ]
				}, {
					// 副词条
					main: [ 108, 108, 108, 108, 104, 104, 102, 102, 78, 78, 0, 0, 0, 0, 0, 0, 0, 0 ],
					sub: [ 108, 108, 108, 108, 104, 104, 102, 102, 78, 78, 0, 0, 0, 0, 0, 0, 0, 0 ]
				}, {
					// 时之沙
					main: [ 0, 247, 0, 247, 132, 132, 0, 242, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
					sub: [ 108, 108, 108, 108, 104, 104, 102, 102, 78, 78, 0, 0, 0, 0, 0, 0, 0, 0 ]
				}, {
					// 空之杯
					main: [ 0, 227, 0, 227, 0, 117, 0, 212, 0, 0, 31, 31, 31, 31, 31, 31, 31, 0 ],
					sub: [ 108, 108, 108, 108, 104, 104, 102, 102, 78, 78, 0, 0, 0, 0, 0, 0, 0, 0 ]
				}, {
					// 理之冠
					main: [ 0, 209, 0, 209, 0, 117, 0, 198, 96, 96, 0, 0, 0, 0, 0, 0, 0, 75 ],
					sub: [ 108, 108, 108, 108, 104, 104, 102, 102, 78, 78, 0, 0, 0, 0, 0, 0, 0, 0 ]
				} ],
				// 数值大小
				stage: [ 235, 245, 255, 265 ],
				// 初始词条个数
				number: [ 0, 0, 0, 720, 280 ]
			},
			/**
			 * 圣遗物副属性权值
			 */
			values: [
				// HP      HP%     DEF    DEF%    ER%     EM     ATK    ATK%    CD%     CR%
				[ 298.75, 0.0583, 23.15, 0.0729, 0.0648, 23.31, 19.45, 0.0583, 0.0777, 0.0389 ], // 一档
				[ 268.88, 0.0525, 20.83, 0.0656, 0.0583, 20.98, 17.51, 0.0525, 0.0699, 0.0350 ], // 二档
				[ 239.00, 0.0466, 18.52, 0.0583, 0.0518, 18.65, 15.56, 0.0466, 0.0622, 0.0311 ], // 三档
				[ 209.13, 0.0408, 16.20, 0.0510, 0.0453, 16.32, 13.62, 0.0408, 0.0544, 0.0272 ]  // 四档
			]
		},
		suits: {}
	} );
}

export function getSlip(): SlipDetail {
	return <SlipDetail>getMetaData( "slip" ) || { SlipInfo: [] };
}

export function getInfo( name: string ): InfoResponse | null {
	const typeList = [ "character", "weapon", "artifact" ];
	for ( const type of typeList ) {
		const filePath: string = `${ basePath }/${ type }/${ name }/data.json`;
		const data = bot.file.loadFile( filePath, "root" );
		if ( data ) return isJsonString( data ) ? JSON.parse( data ) : null;
	}
	return null;
}

export function getAliasName(): AliasMap {
	return getMetaData( "alias" ) || {};
}

export function getDailyMaterial(): DailyMaterial {
	const data = getMetaData( "daily" );
	if ( !data ) {
		return {
			"Mon&Thu": [],
			"Tue&Fri": [],
			"Wed&Sat": []
		}
	}
	return <any>Object.fromEntries( Object.entries( data ).map( ( [ key, value ] ) => {
		return [ key, Object.values( value ).flat() ]
	} ) );
}

/* 文本来源 可莉特调 https: //genshin.pub/ */
export function getAlmanacText(): Record<string, FortuneData[]> {
	return getMetaData( "almanac" ) || {};
}

export function getUidHome(): { name: string }[] {
	const data = getMetaData( "home" );
	return data?.list || [];
}

export function getCharacterList(): CharacterList {
	return getMetaData( "character" ) || {};
}

export function getWeaponList(): WeaponList {
	return getMetaData( "weapon" ) || {};
}

export function getCharacterGuide( name: string ): string {
	return bot.file.loadFile( `${ basePath }/resource/guide/${ name }.png`, "root", "binary" );
}