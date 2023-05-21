import {
	AbyssRouter,
	AbyssRouterCharacter, AbyssRouterOverview, AbyssRouterSingle,
	InfoFullResponse,
	isArtifactInfo,
	isCharacterInfo,
	isWeaponInfo
} from "#/genshin/types";

export interface AbyssParser {
	dataList: Record<string, AbyssRouterCharacter>;
	reveals: AbyssRouterCharacter[];
	showData: boolean;
}

export function abyssDataParser( data: AbyssRouterSingle | AbyssRouterOverview ): AbyssParser {
	const dataList = {
		最强一击: data.damageRank[0],
		击破数: data.defeatRank[0],
		承受伤害: data.takeDamageRank[0],
		元素战技次数: data.normalSkillRank[0],
		元素爆发次数: data.energySkillRank[0]
	};
	
	/* 判断深渊数据是否为空 */
	const showData = !!Object.values( dataList ).filter( item => !!item ).length;
	
	/* 只显示前四个出战次数 */
	const reveals = data.revealRank.splice( 0, 4 );
	
	return {
		reveals,
		dataList,
		showData
	};
}

export function cardDataParser( data ) {
	const { avatars, stats, explorations, homes, allHomes } = data;
	
	/* 角色根据等级好感度排序 */
	avatars.sort( ( x, y ) => {
		return x.level === y.level ? y.fetter - x.fetter : y.level - x.level;
	} );
	
	const statsList = {
		base: [ {
			label: "活跃天数",
			value: stats.activeDayNumber
		}, {
			label: "成就达成",
			value: stats.achievementNumber
		}, {
			label: "获得角色",
			value: stats.avatarNumber
		}, {
			label: "深境螺旋",
			value: stats.spiralAbyss
		}, {
			label: "秘境解锁",
			value: stats.domainNumber
		} ],
		chest: [ {
			icon: "/assets/genshin/resource/chest/treasure_chest_1.png",
			label: "普通宝箱",
			value: stats.commonChestNumber
		}, {
			icon: "/assets/genshin/resource/chest/treasure_chest_2.png",
			label: "精致宝箱",
			value: stats.exquisiteChestNumber
		}, {
			icon: "/assets/genshin/resource/chest/treasure_chest_3.png",
			label: "珍贵宝箱",
			value: stats.preciousChestNumber
		}, {
			icon: "/assets/genshin/resource/chest/treasure_chest_4.png",
			label: "华丽宝箱",
			value: stats.luxuriousChestNumber
		}, {
			icon: "/assets/genshin/resource/chest/treasure_chest_5.png",
			label: "奇馈宝箱",
			value: stats.magicChestNumber
		} ],
		culus: [ {
			icon: "/assets/genshin/resource/material/散失的风神瞳.png",
			label: "风神瞳数",
			value: stats.anemoculusNumber
		}, {
			icon: "/assets/genshin/resource/material/散失的岩神瞳.png",
			label: "岩神瞳数",
			value: stats.geoculusNumber
		}, {
			icon: "/assets/genshin/resource/material/散失的雷神瞳.png",
			label: "雷神瞳数",
			value: stats.electroculusNumber
		}, {
			icon: "/assets/genshin/resource/material/散失的草神瞳.png",
			label: "草神瞳数",
			value: stats.dendroculusNumber
		} ]
	};
	
	const chasmsMaw = explorations.find( el => el.id === 7 );
	
	const explorationsList = explorations
		.map( el => {
			let { id, name, offerings, explorationPercentage } = el;
			if ( id === 6 ) {
				name = "层岩巨渊";
				if ( offerings && chasmsMaw ) {
					offerings.unshift( {
						name: "地下矿区",
						percent: chasmsMaw.explorationPercentage / 10
					} )
				}
			}
			return {
				...el,
				name,
				offerings,
				explorationPercentage: `${ explorationPercentage / 10 }%`
			}
		} )
		/* 按id排序防乱序 */
		.sort( ( x, y ) => x.id - y.id )
		.filter( el => el.id !== 7 );
	
	let homesLevel = 0;
	let maxComfort = 0;
	if ( homes.length !== 0 ) {
		homesLevel = homes[0].level;
		maxComfort = homes[0].comfortNum;
	}
	
	const formatHomes = allHomes.map( ( h ) => {
		const homeData = homes.find( ( el ) => el.name === h.name );
		return homeData ? homeData : { name: h.name, level: -1 };
	} );
	
	return {
		statsList,
		explorationsList,
		homesLevel,
		maxComfort,
		formatHomes
	};
}

export function infoDataParser( data: InfoFullResponse ) {
	/* 星级 icon */
	const rarityIcon = `/assets/genshin/resource/info/icon/BaseStar${ isArtifactInfo( data ) ? Math.max( ...data.levelList ) : data.rarity }.png`;
	
	const getMainImage = () => {
		const baseURL = "/assets/genshin/";
		if ( isCharacterInfo( data ) ) {
			return baseURL + `character/${ data.name }/image/gacha_splash.png`;
		}
		if ( isWeaponInfo( data ) ) {
			return baseURL + `weapon/${ data.name }/image/portrait.png`;
		}
		return baseURL + `artifact/${ data.name }/image/${ data.icon }.png`;
	};
	
	const mainImage = getMainImage();
	
	return {
		rarityIcon,
		mainImage
	};
}

export const initBaseColor = ( data: InfoFullResponse ) => {
	const setStyle = ( colorList ) => {
		document.body.style.setProperty( "--base-color", colorList[0] );
		document.body.style.setProperty( "--shadow-color", colorList[1] );
		document.body.style.setProperty( "--light-color", colorList[2] );
		document.body.style.setProperty( "--hue-rotate", colorList[3] );
	}
	
	const rarity = isArtifactInfo( data ) ? Math.max( ...data.levelList ) : data.rarity;
	
	switch ( rarity ) {
		case 5:
			setStyle( [ "rgba(115, 90, 44, 1)", "rgba(198, 156, 80, 0.4)", "rgba(198, 156, 80, 1)", "0deg" ] );
			break;
		case 4:
			setStyle( [ "rgba(94, 44, 115, 1)", "rgba(157, 80, 199, 0.4)", "rgba(153, 80, 199, 1)", "235deg" ] );
			break;
		case 3:
			setStyle( [ "rgba(44, 69, 115, 1)", "rgba(80, 121, 199, 0.4)", "rgba(80, 121, 199, 1)", "190deg" ] );
	}
}

export const sizeClass = ( rowLength ) => {
	const sizeClassFnObj = {
		3: ( dataList, index ) => {
			index++;
			if (
				( dataList.length % 3 === 1 && index > dataList.length - 4 ) ||
				( dataList.length % 3 === 2 && index > dataList.length - 2 )
			) {
				return "large";
			}
			return "medium";
		},
		4: ( dataList, index ) => {
			index++;
			if ( dataList.length % 4 !== 0 ) {
				if ( index > ( Math.floor( ( dataList.length + 1 ) / 4 ) - 1 ) * 4 ) {
					return "large";
				}
			}
			return "medium";
		},
	};
	return sizeClassFnObj[rowLength];
}