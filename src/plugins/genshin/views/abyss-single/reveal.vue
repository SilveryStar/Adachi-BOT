<script lang="ts" setup>
import { AbyssParser } from "#/genshin/front-utils/data-parser";

defineProps<{
	data: AbyssParser["reveals"];
}>()

const getSideIcon = name => `/assets/genshin/character/${ name }/image/side.png`;
</script>

<template>
	<ul class="reveal">
		<li v-for="(d , dKey) of data" :key="dKey">
			<img :src="getSideIcon(d.name)" alt="ERROR">
			<span>{{ d.value }} 次</span>
		</li>
	</ul>
</template>

<style lang="scss" scoped>
.reveal {
	margin: 0;
	padding: 0;
	width: 378px;
	display: flex;
	border-radius: 16px;
	background-color: rgba(97, 102, 184, .3);
	box-shadow: 0 3px 8px 1px rgba(0, 0, 0, .3);
	flex-wrap: wrap;
	align-items: center;

	li {
		padding: 0 32px;
		width: 50%;
		height: 70px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		box-sizing: border-box;

		&:nth-of-type(4n + 1),
		&:nth-of-type(4n + 2) {
			background-color: rgba(0, 0, 0, .2);
		}

		img {
			margin-bottom: 8px;
			height: 52px;
		}

		span {
			font-size: 24px;
		}
	}
}
</style>