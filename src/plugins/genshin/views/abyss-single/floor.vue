<script lang="ts" setup>
import Room from "./room.vue";
import { AbyssFloors, AbyssRoom } from "#/genshin/types";

const props = defineProps<{
	data: AbyssFloors;
}>();

/* 获取三间数据，无数据使用默认数据填充 */
const levels = Array.from( { length: 3 } ).map( ( fake, lKey ) => {
	const index = lKey + 1;
	const level = props.data.levels?.find( f => f.index === index );
	return level || <AbyssRoom>{
		index,
		battles: []
	}
} )
</script>

<template>
	<div class="floor">
		<header class="floor-title">第{{ data.index }}层</header>
		<section class="floor-room-list">
			<Room v-for="(l, lKey) of levels" :key="lKey" :data="l"></Room>
		</section>
	</div>
</template>

<style lang="scss" scoped>
.floor {
	width: 425px;
	padding: 0 25px;
	background-color: rgba(97, 102, 184, .2);
	border-radius: 14px;
	box-shadow: 2px 2px 4px 4px rgba(0, 0, 0, .3);
	box-sizing: border-box;

	.floor-title {
		position: relative;
		padding: 23px 6px 13px;
		width: 222px;
		font-size: 32px;
		text-shadow: 4px 3px 1px rgba(0, 0, 0, 1);

		&::after {
			content: "";
			position: absolute;
			width: 100%;
			height: 1px;
			left: 0;
			bottom: 0;
			background-color: rgba(255, 255, 255, .1);
			box-shadow: 1px 1px 1px 1px rgb(0, 0, 0, .3);
		}
	}

	.floor-room-list {
		.room {
			border-bottom: 1px solid rgba(255, 255, 255, .1);

			&:last-child {
				border-bottom: none;
			}
		}
	}
}
</style>