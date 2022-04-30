const template = `<div v-if="showData" class="overview">
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
			<CharacterItem v-for="(char, index) in reveals" :key="index" class="character-item" :char="char" type="reveal"/>
		</div>
	</div>
	<div class="battle-data">
		<SectionTitle>战斗数据</SectionTitle>
		<ul class="data-list">
			<li v-for="key of Object.keys(dataList)" :key="key">
				<span>{{key}}: {{dataList[key].value}}</span>
				<img :src="dataList[key].avatarIcon" alt="ERROR" />
			</li>
		</ul>
	</div>
</div>
<div v-else class="no-data">
	<p>暂无挑战数据</p>
</div>
`;

import { abyssDataParser } from "../../public/js/abyss-data-parser.js"
import SectionTitle from "./section-title.js";
import CharacterItem from "./character-item.js";

const { defineComponent } = Vue;

export default defineComponent( {
	name: "AbyssOverview",
	template,
	components: {
		SectionTitle,
		CharacterItem
	},
	props: {
		data: Object
	},
	setup( { data } ) {
		const parsed = abyssDataParser( data );
		
		const reveals = parsed.reveals.map( ( el ) => {
			return {
				...el,
				icon: el.avatarIcon
			};
		} );
		
		return {
			...parsed,
			reveals
		}
	}
} );
