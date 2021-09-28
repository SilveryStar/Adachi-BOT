const template =
`<div class="overview">
	<img class="background" :src="abyssBackground" alt="ERROR"/>
	<span class="title">{{ data.nickname }} 的深境螺旋概览</span>
	<div class="info">
		<span class="max-floor">最深抵达： {{ data.maxFloor }}</span>
		<span class="battle-times">挑战次数： {{ data.totalBattleTimes }}</span>
		<img class="star-img" src="../../public/images/abyss/star.png" alt="ERROR"/>
		<span class="star-num">{{ data.totalStar }}</span>
	</div>
	<div class="reveal">
		<span class="subtitle">出战次数</span>
		<CharacterList v-for="chars in reveal" :chars="chars" type="reveal"/>
	</div>
	<span class="subtitle">战斗数据榜</span>
	<div class="data-list">
		<DataRow v-for="i in 5" :title="titleList[i - 1]" :data="dataList[i - 1]" :line="i"/>
	</div>
</div>`;

import Vue from "../../public/js/vue.js";
import CharacterList from "./character-list.js";
import DataRow from "./data-row.js";

export default Vue.defineComponent( {
	name: "AbyssOverview",
	template,
	components: {
		CharacterList,
		DataRow
	},
	props: {
		data: Object
	},
	setup( props ) {
		const arr = props.data.revealRank.map( el => {
			el.icon = el.avatarIcon;
			return el;
		} );
		const reveal = [ arr.splice( 0,4 ), arr ];
		
		const dataList = [ props.data.damageRank, props.data.defeatRank, props.data.takeDamageRank,
						   props.data.normalSkillRank, props.data.energySkillRank ];
		const titleList = [ "最强一击", "击破数", "承受伤害", "元素战技次数", "元素爆发次数" ]
		
		const abyssBackground = Vue.computed( () => {
			return "/public/images/abyss/OverviewBackground.png";
		} );

		return {
			abyssBackground,
			reveal,
			dataList,
			titleList
		}
	}
} );