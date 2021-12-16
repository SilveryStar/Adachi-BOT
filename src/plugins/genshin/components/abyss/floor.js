const template =
`<div class="floor" :class="{ long: floor >= 5, short: floor < 5 }">
	<img class="background" :src="floorLongBackground" alt="ERROR"/>
	<span class="title">{{ data.info }} 的深境螺旋战绩</span>
	<span class="floor-number">{{ floor }}</span>
	<AbyssRoom v-for="r in 3" :roomData="data.data.levels[r - 1]" :floor="floor"/>
</div>`;

import AbyssRoom from "./room.js";
const { defineComponent, computed } = Vue;

export default defineComponent( {
	name: "AbyssFloor",
	template,
	components: {
		AbyssRoom
	},
	props: {
		data: Object
	},
	setup( { data } ) {
		const floorLongBackground = computed( () => {
			return `../../public/images/abyss/Floor${ data.floor >= 5 ? "Long" : "Short" }Background.png`;
		} );
		const floor = parseInt( data.floor );
		
		return {
			floorLongBackground,
			floor
		};
	}
} );