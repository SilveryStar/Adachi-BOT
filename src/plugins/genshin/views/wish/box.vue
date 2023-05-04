<template>
	<div class="wish-box">
		<img class="box-background" :src="boxBackground" alt="ERROR"/>
		<div class="character" v-if="d.type === '角色'">
			<img class="type" :src="typeIcon" alt="ERROR"/>
			<img class="main" :src="mainImage" alt="ERROR"/>
		</div>
		<div class="weapon" v-else>
			<img class="main" :src="mainImage" alt="ERROR"/>
			<img class="main shadow" :src="mainImage" alt="ERROR"/>
			<img class="type" :src="typeIcon" alt="ERROR"/>
		</div>
		<p class="times" v-if="d.rank === 5">
			「{{ d.times }}抽」
		</p>
		<img class="rank" :src="rankIcon" alt="ERROR"/>
	</div>
</template>

<script lang="ts" setup>
import { computed } from "vue";

const props = withDefaults( defineProps<{
	d: Record<string, any>;
}>(), {
	d: () => ( {} )
} );

function toString( num ) {
	switch ( num ) {
		case 5:
			return "Five";
		case 4:
			return "Four";
		case 3:
			return "Three";
	}
}

const boxBackground = computed( () => {
	return `/genshin/public/images/item/${ toString( props.d.rank ) }Background.png`;
} );
const mainImage = computed( () => {
	const type = props.d.type === "武器" ? "weapon" : "character";
	return `https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/wish/${ type }/${ props.d.name }.png`;
} );
const typeIcon = computed( () => {
	const type = props.d.type === "武器" ? "type" : "element";
	return `/genshin/public/images/${ type }/${ props.d.el }.png`;
} );
const rankIcon = computed( () => {
	return `/genshin/public/images/item/${ toString( props.d.rank ) }Star.png`;
} );
</script>

<style lang="scss" scoped>
.wish-box {
	position: relative;
	width: 86px;

	.box-background {
		position: absolute;
		width: 86px;
		z-index: 0;
	}

	.character,
	.weapon {
		position: absolute;
	}

	.main {
		position: relative;
		z-index: 1;
		width: 82px;
	}

	.type,
	.rank {
		position: relative;
		z-index: 2;
	}

	.rank {
		position: relative;
		width: 61px;
		left: 13px;
		top: 393px;
	}

	.character {
		.type {
			width: 44px;
			left: 21px;
			top: 336px;
		}

		.main {
			position: absolute;
			top: 76px;
			height: 363px;
			left: 0.04cm;
		}
	}

	.weapon {
		.main {
			position: relative;
			top: 141px;
			z-index: 1;
		}

		.shadow {
			position: relative;
			top: -93px;
			left: 3px;
			filter: brightness(0%);
			opacity: 0.72;
			z-index: 0;
		}

		.type {
			position: absolute;
			width: 56px;
			left: 14px;
			top: 328px;
		}
	}

	.times {
		position: absolute;
		width: 64px;
		font-size: 15px;
		left: 10px;
		top: 449px;
		color: rgb(220, 220, 220);
		background-color: rgba(64, 64, 64, 0.3);
		text-align: center;
	}
}
</style>