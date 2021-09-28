const template =
`<div class="data-row" :class="line % 2 === 1 ? 'tagged' : ''">
	<span class="data-title">{{ title }}:</span>
	<div class="list">
		<div class="data-item" v-for="d in data">
			<img class="side-icon" :src="d.avatarIcon" alt="ERROR"/>
			<span class="data-num">{{ d.value }}</span>
		</div>
	</div>
</div>`;

import Vue from "../../public/js/vue.js";
import CharacterItem from "./character-item.js";

export default Vue.defineComponent( {
	name: "DataRow",
	template,
	props: {
		title: String,
		data: Object,
		line: Number
	}
} );