const template = `<div class="floor">
	<p class="floor-number">{{ floor }}</p>
	<main>
		<template v-for="r in 3" :key="r">
			<AbyssRoom v-if="data.data.levels[r - 1]" class="room-item" :roomData="data.data.levels[r - 1]" :floor="floor"/>
		</template>
	</main>
</div>`;

import AbyssRoom from "./room.js";

const { defineComponent } = Vue;

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
		const floor = parseInt( data.floor );
		
		return {
			floor
		}
	}
} );
