<template>
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
	</div>
</template>

<script lang="ts" setup>
withDefaults( defineProps<{
	data: Record<string, any>;
}>(), {
	data: () => ( {
		offerings: []
	} )
} );
</script>

<style lang="scss" scoped>
.exploration-base {
	position: relative;
	background-color: #404d75;
	border: 0.1em solid #394467;
	min-height: 14em;
	padding: 1.6em 1.2em;
	border-radius: 0.4em;
	box-sizing: border-box;
	color: #fff;
	font-size: 10px;

	img {
		position: absolute;
		width: 10em;
		height: 10em;
		right: 1em;
		bottom: 1em;
		filter: brightness(200%);
		opacity: 0.25;
	}

	> p {
		font-size: 2.8em;
		margin-bottom: 0.357em;
	}

	.card-exploration-info {
		font-size: 2em;
		line-height: 1.2em;
		opacity: 0.6;
	}
}
</style>