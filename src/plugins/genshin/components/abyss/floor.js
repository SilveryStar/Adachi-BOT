const template =
`<div class="floor" :class="{ long: data.floor >= 5, short: data.floor < 5 }">
	<img class="background" :src="floorLongBackground" alt="ERROR"/>
	<span class="title">{{ data.nickname }} 的深境螺旋战绩</span>
	<span class="floor-number">{{ data.floor }}</span>
	<AbyssRoom v-for="r in 3" :roomData="data.levels[r - 1]" :floor="data.floor"/>
</div>`;

import Vue from "../../public/js/vue.js";
import AbyssRoom from "./room.js";

export default Vue.defineComponent( {
	name: "AbyssFloor",
	template,
	components: {
		AbyssRoom
	},
	props: {
		data: Object
	},
	setup( props ) {
		const floorLongBackground = Vue.computed( () => {
			return `/public/images/abyss/Floor${ props.data.floor >= 5 ? "Long" : "Short" }Background.png`;
		} );
		
		return {
			floorLongBackground
		};
	}
} );