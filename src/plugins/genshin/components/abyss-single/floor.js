const template = `<div class="floor">
	<header class="floor-title">第{{ data.index }}层</header>
	<section class="floor-room-list">
		<Room v-for="(r, rKey) of data.levels" :key="rKey" :data="r"></Room>
	</section>
</div>`;

import Room from "./room.js"

const { defineComponent } = Vue;

export default defineComponent( {
	name: "Floor",
	components: {
		Room
	},
	props: {
		data: {
			type: Object,
			default: () => ( {} )
		}
	},
	template
} )