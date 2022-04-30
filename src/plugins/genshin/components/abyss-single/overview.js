const template = `
	<SectionTitle>战斗数据</SectionTitle>
	<ul class="overview">
		<li v-for="(d ,dKey) of formatData" :key="dKey">
			<div class="battle-char-box" :class="d.className">
				<img :src="d.avatarIcon" alt="ERROR">
			</div>
			<p>{{ d.label }}</p>
			<p>{{ d.value }}</p>
		</li>
	</ul>`;

import SectionTitle from "../abyss/section-title.js";

const { defineComponent } = Vue;

export default defineComponent( {
	name: "Overview",
	components: {
		SectionTitle
	},
	props: {
		data: {
			type: Array,
			default: () => []
		}
	},
	template,
	setup( props ) {
		const data = props.data;
		
		const formatData = [];
		
		for ( const dKey in data ) {
			const d = data[dKey];
			if ( !d ) continue;
			formatData.push( {
				...d,
				label: dKey,
				avatarIcon: `https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/thumb/character/${ d.name }.png`,
				className: `rarity-${ d.rarity }`
			} );
		}
		
		return {
			formatData
		};
	}
} )