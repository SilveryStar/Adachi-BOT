const template = `
<div class="abyss-upper">
	<h2> 出战次数 </h2>
    <div class="reveal-rank-container">
		<div class="char-box-flexbox" v-for="item in reveal_info">
			<AbyssCharBox :char="item"/>
		</div>
    </div>
</div>`;

import Vue from "../public/js/vue.js";
import AbyssCharBox from "./abyss-char-box.js";

export default Vue.defineComponent( {
	name: "AbyssUpper",
	template,
	components: {
		AbyssCharBox
	},
	props: {
		reveal_rank: Array
	},
	setup( props ) {
		const reveal_info = props.reveal_rank.slice( 0, 8 )
		return {
			reveal_info
		}
	}
} );
