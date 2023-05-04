<template>
	<div v-if="parsed && parsed.showData" class="overview">
		<ul class="info">
			<li>最深抵达： {{ data.maxFloor }}</li>
			<li>挑战次数： {{ data.totalBattleTimes }}</li>
			<li>
				<img class="star-img" src="https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/abyss/star.png"
				     alt="ERROR"/>
				<span class="star-num">{{ data.totalStar }}</span>
			</li>
		</ul>
		<div class="reveal">
			<SectionTitle>出战次数</SectionTitle>
			<div class="character-list">
				<character-item v-for="(char, index) in reveals" :key="index" :char="char" type="reveal"/>
			</div>
		</div>
		<div class="battle-data">
			<SectionTitle>战斗数据</SectionTitle>
			<ul class="data-list">
				<li v-for="key of Object.keys(parsed.dataList)" :key="key">
					<span>{{ key }}: {{ parsed.dataList[key].value }}</span>
					<img :src="parsed.dataList[key].avatarIcon" alt="ERROR"/>
				</li>
			</ul>
		</div>
	</div>
	<div v-else class="no-data">
		<p>暂无挑战数据</p>
	</div>
</template>

<script lang="ts" setup>
import { abyssDataParser } from "#/genshin/front-utils/data-parser";
import SectionTitle from "#/genshin/components/section-title/index.vue";
import CharacterItem from "./character-item.vue";
import { OverviewData } from "#/genshin/views/abyss/index.vue";
import { computed } from "vue";

const props = withDefaults(defineProps<{
	data: OverviewData | null
}>(), {
	data: null
});

const parsed = computed(() => {
	if ( !props.data ) return null;
	return abyssDataParser( props.data );
});

const reveals = computed(() => {
	const reveals = parsed.value?.reveals;
	if ( !reveals ) return [];
	return reveals.map( el => {
		return {
			...el,
			icon: el.avatarIcon
		};
	} );
});
</script>

<style lang="scss" scoped>
.overview {
	padding-top: 118px;

	.info {
		display: flex;
		justify-content: center;
		align-items: center;
		margin: 0 auto;
		list-style: none;
		font-size: 20px;
		color: #fff;

		li {
			display: flex;
			align-items: center;
			margin: 0 13px;

			img {
				width: 28px;
				margin-right: 6px;
				filter: brightness(200%);
			}
		}
	}

	/* 出战次数 */
	.reveal {
		margin-top: 50px;

		.character-list {
			width: 678px;
			margin: 38px auto 0;
			display: flex;
			justify-content: space-between;

			.character-item {
				font-size: 9.0566px;
			}
		}
	}

	/* 战斗数据 */
	.battle-data {
		margin-top: 36px;

		.data-list {
			margin-top: 34px;
			list-style: none;
			display: flex;
			flex-wrap: wrap;

			li {
				display: flex;
				flex: 1;
				align-items: center;
				min-width: 50%;
				font-size: 20px;
				color: #fff;
				box-sizing: border-box;

				&:nth-of-type(4n + 1),
				&:nth-of-type(4n + 2) {
					background-color: #1f1f48;
				}

				&:nth-of-type(2n + 1) {
					justify-content: flex-start;
					padding-left: 160px;
				}

				&:nth-of-type(2n) {
					justify-content: flex-end;
					padding-right: 150px;
				}
			}

			span {
				display: inline-block;
				width: 220px;
			}

			img {
				position: relative;
				top: -8px;
				width: 44px;
			}
		}
	}
}

/* 空数据 */
.no-data {
	display: flex;
	justify-content: center;
	align-items: center;
	padding-top: 120px;
	height: 200px;
	font-size: 42px;
	color: #fff;
}
</style>