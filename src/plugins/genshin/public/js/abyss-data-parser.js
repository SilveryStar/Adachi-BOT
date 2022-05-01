export function abyssDataParser( data ) {
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