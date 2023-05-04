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

<script lang="ts" setup>
import SectionTitle from "#/genshin/components/section-title/index.vue";

const props = withDefaults( defineProps<{
	data: any[];
}>(), {
	data: () => []
} );

const data: any[] = props.data;

const formatData: any[] = [];

for ( const dKey in data ) {
	const d: Record<string, any> = data[dKey];
	if ( !d ) continue;
	formatData.push( {
		...d,
		label: dKey,
		avatarIcon: `https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/thumb/character/${ d.name }.png`,
		className: `rarity-${ d.rarity }`
	} );
}
</script>

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
				background: linear-gradient(0deg, #917ab1 0%, #6c6192 100%) #917ab1;
				box-shadow: 0 0 0 9px rgba(177, 215, 255, .2);
			}

			&.rarity-5 {
				background: linear-gradient(0deg, #de9552 0%, #9a6d43 100%) #9a6d43;
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