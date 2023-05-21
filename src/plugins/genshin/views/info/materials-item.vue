<script lang="ts" setup>
import { computed } from "vue";
import { InfoMaterial } from "#/genshin/types";

const props = defineProps<{
	data: InfoMaterial;
	showTitle: boolean;
}>();

const title = computed( () => {
	if ( !props.showTitle ) return "";
	const result = props.data.name.match( /「(.+)」.+/ );
	return result ? result[1] : "";
} );

const itemStyle = computed( () => ( {
	backgroundImage: `url(/assets/genshin/resource/rarity/bg/Background_Item_${ props.data.rank === 105 ? '5a' : props.data.rank }_Star.png)`
} ) );
</script>

<template>
	<div class="materials-item" :style="itemStyle">
		<img class="material-icon" :src="`/assets/genshin/resource/material/${data.name}.png`" alt="ERROR"/>
		<p v-if="title" class="materials-title">{{ title }}</p>
		<p class="materials-count" :data-count="data.count"></p>
	</div>
</template>

<style lang="scss" scoped>
.materials-item {
	position: relative;
	width: 64px;
	height: 64px;
	border-radius: 8px;
	background-size: cover;
	overflow: hidden;

	&:after {
		content: "";
		position: absolute;
		left: 2px;
		bottom: 2px;
		right: 2px;
		top: 2px;
		border: 1px solid var(--light-color);
		border-radius: 8px;
	}

	.material-icon {
		width: 100%;
		height: 100%;
		border-radius: 8px;
		border: 1px solid var(--light-color);
		box-sizing: border-box;
	}

	.materials-title {
		position: absolute;
		left: 0;
		bottom: 6px;
		width: 100%;
		height: 16px;
		background-color: rgba(0, 0, 0, .6);
		font-size: 12px;
		line-height: 19px;
		color: #fff;
		text-align: center;
	}

	.materials-count {
		position: absolute;
		width: 50px;
		height: 20px;
		right: -15px;
		top: 0;

		&::before {
			content: "";
			position: absolute;
			top: 0;
			left: 0;
			bottom: 0;
			right: 0;
			background-color: #c70000;
			transform: rotateZ(45deg);
		}

		&::after {
			content: attr(data-count);
			position: absolute;
			top: 50%;
			right: 20px;
			transform: translateY(-50%) scale(.8);
			transform-origin: right center;
			font-size: 12px;
			color: #fff;
		}
	}
}
</style>