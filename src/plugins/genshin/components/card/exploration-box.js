const template = `
<div class="exploration-base">
	<p>
		<span>{{ data.name }}&nbsp;</span>
		<span>{{ data.explorationPercentage }}</span>
	</p>
	<div class="card-exploration-info">
		<p v-if="data.type !== 'Offering'">声望: Lv.{{ data.level || 0 }}</p>
		<template v-if="data.offerings">
			<p v-for="(offer, offerIndex) in data.offerings" :key="offerIndex">
				<span>{{ offer.name }}: </span>
				<span v-if="offer.level !== undefined">Lv.{{ offer.level }}</span>
				<span v-else>{{ offer.percent }}%</span>
			</p>
		</template>
	</div>
	<img
		:src="data.icon"
		alt="ERROR"
	/>
</div>`;

const { defineComponent } = Vue;

export default defineComponent( {
	name: "ExplorationBox",
	template,
	props: {
		data: {
			type: Object,
			default: () => ( {
				offerings: []
			} )
		}
	}
} );
