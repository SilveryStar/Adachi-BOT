const template = `<div class="overview">
	<ul class="info">
		<li>最深抵达： {{ data.maxFloor }}</li>
		<li>挑战次数： {{ data.totalBattleTimes }}</li>
		<li>
			<img class="star-img" src="https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/abyss/star.png" alt="ERROR"/>
			<span class="star-num">{{ data.totalStar }}</span>
		</li>
	</ul>
	<div class="reveal">
		<SectionTitle>出战次数</SectionTitle>
		<div class="character-list">
			<CharacterItem v-for="(char, index) in reveal" :key="index" class="character-item" :char="char" type="reveal"/>
		</div>
	</div>
	<div class="battle-data">
		<SectionTitle>战斗数据</SectionTitle>
		<ul class="data-list">
			<li v-for="key of Object.keys(dataList)" :key="key">
				<span>{{key}}: {{dataList[key][0].value}}</span>
				<img :src="dataList[key][0].avatarIcon" alt="ERROR" />
			</li>
		</ul>
	</div>
</div>`;

import SectionTitle from "./section-title.js";
import CharacterItem from "./character-item.js";
const { defineComponent } = Vue;

export default defineComponent({
	name: "AbyssOverview",
	template,
	components: {
		SectionTitle,
		CharacterItem,
	},
	props: {
		data: Object,
	},
	setup({ data }) {
		const arr = data.revealRank.map((el) => {
			el.icon = el.avatarIcon;
			return el;
		});
		const reveal = [...arr.splice(0, 4)];

		const dataList = {
			最强一击: data.damageRank,
			击破数: data.defeatRank,
			承受伤害: data.takeDamageRank,
			元素战技次数: data.normalSkillRank,
			元素爆发次数: data.energySkillRank,
		};

		return {
			reveal,
			dataList,
		};
	},
});
