<script lang="ts" setup>
import SectionTitle from "#/genshin/components/section-title/index.vue";
import { AbyssParser } from "#/genshin/front-utils/data-parser";

const props = defineProps<{
	data: AbyssParser["dataList"];
}>();

const formatData: any[] = [];

for ( const dKey in props.data ) {
	const d = props.data[dKey];
	if ( !d ) continue;
	formatData.push( {
		...d,
		label: dKey,
		avatarIcon: `/assets/genshin/character/${ d.name }/image/face.png`,
		className: `rarity-${ d.rarity }`
	} );
}
</script>

<template>
	<section-title>战斗数据</section-title>
	<ul class="overview">
		<li v-for="(d ,dKey) of formatData" :key="dKey">
			<div class="battle-char-box" :class="d.className">
				<img :src="d.avatarIcon" alt="ERROR">
			</div>
			<p>{{ d.label }}</p>
			<p>{{ d.value }}</p>
		</li>
	</ul>
</template>

<style lang="scss" scoped>
.overview {
	margin-top: 42px;
	display: flex;
	justify-content: space-between;
	align-items: center;

	li {
		width: 160px;
		text-align: center;
		text-shadow: 3px 2px 1px rgba(0, 0, 0, 1);

		.battle-char-box {
			display: inline-block;
			margin-bottom: 16px;
			width: 136px;
			height: 136px;
			border-radius: 50%;

			&.rarity-4 {
				background: url("/assets/genshin/resource/rarity/bg/Background_Item_4_Star.png") no-repeat;
				background-size: cover;
				box-shadow: 0 0 0 9px rgba(177, 215, 255, .2);
			}

			&.rarity-5 {
				background: url("/assets/genshin/resource/rarity/bg/Background_Item_5_Star.png") no-repeat;
				background-size: cover;
				box-shadow: 0 0 0 9px rgba(255, 215, 135, .2);
			}

			img {
				width: 100%;
				height: 100%;
				border-radius: 50%;
			}
		}

		p {
			margin: 8px;
			font-size: 24px;
		}
	}
}
</style>