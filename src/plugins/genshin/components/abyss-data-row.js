const template = `
<div class="abyss-data-row">
	<span class="data-row-title"> {{title}} </span>
	<div class="data-row-item" v-for="item in info">
		<span> {{ item.value }} </span>
		<img :src="item.avatar_icon"/>
	</div>
</div>`;

import Vue from "../public/js/vue.js";

export default Vue.defineComponent( {
	name: "AbyssDataRow",
	template,
	props: {
		title: String,
		rank: Array
	},
	setup( props ) {
		const info = props.rank.slice( 0, 3 );
		return {
			info
		}
	}
} );
