const template =
`<div class="daily-column">
	<div class="title">{{ title }}</div>
	<DailyUnit
		v-if="data.length !== 0"
		v-for="d in data"
		:data="d"
		:type="type"
	/>
	<div v-else class="empty-box">
		今日没有可刷取材料的{{ type === "character" ? "角色" : "武器" }}
	</div>
</div>`;

import Vue from "../../public/js/vue.js";
import DailyUnit from "./unit.js"

export default Vue.defineComponent( {
	name: "DailyColumn",
	template,
	components: {
		DailyUnit
	},
	props: {
		data: Array,
		type: String
	},
	setup( props ) {
		const title = Vue.computed( () => {
			return `今日${ props.type === "weapon" ? "武器" : "角色" }素材`;
		} );
		
		return { title }
	}
} );