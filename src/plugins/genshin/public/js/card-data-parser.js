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
			icon: "https://adachi-bot.oss-cn-beijing.aliyuncs.com/images/chest/treasure_chest_1.png",
			label: "普通宝箱",
			value: stats.commonChestNumber
		}, {
			icon: "https://adachi-bot.oss-cn-beijing.aliyuncs.com/images/chest/treasure_chest_2.png",
			label: "精致宝箱",
			value: stats.exquisiteChestNumber
		}, {
			icon: "https://adachi-bot.oss-cn-beijing.aliyuncs.com/images/chest/treasure_chest_3.png",
			label: "珍贵宝箱",
			value: stats.preciousChestNumber
		}, {
			icon: "https://adachi-bot.oss-cn-beijing.aliyuncs.com/images/chest/treasure_chest_4.png",
			label: "华丽宝箱",
			value: stats.luxuriousChestNumber
		}, {
			icon: "https://adachi-bot.oss-cn-beijing.aliyuncs.com/images/chest/treasure_chest_5.png",
			label: "奇馈宝箱",
			value: stats.magicChestNumber
		} ],
		culus: [ {
			icon: "https://adachi-bot.oss-cn-beijing.aliyuncs.com/images/culus/Anemoculus.png",
			label: "风神瞳数",
			value: stats.anemoculusNumber
		}, {
			icon: "https://adachi-bot.oss-cn-beijing.aliyuncs.com/images/culus/Geoculus.png",
			label: "岩神瞳数",
			value: stats.geoculusNumber
		}, {
			icon: "https://adachi-bot.oss-cn-beijing.aliyuncs.com/images/culus/Electroculus.png",
			label: "雷神瞳数",
			value: stats.electroculusNumber
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
		data,
		statsList,
		explorationsList,
		homesLevel,
		maxComfort,
		formatHomes
	};
}

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

export function sizeClass( rowLength ) {
	return sizeClassFnObj[rowLength];
}
