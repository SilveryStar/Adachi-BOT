<template>
	<div class="data-piece">
		<div class="icon-box">
			<img :src="pieceIcon" alt="ERROR">
		</div>
		<ul class="piece-content">
			<li class="prev-data">
				<p>{{ prevLabel }}</p>
				<p>{{ data.prev }}</p>
			</li>
			<li class="next-data">
				<p>{{ nextLabel }}</p>
				<p>{{ data.next }}</p>
			</li>
		</ul>
		<div class="piece-footer">
			<p>
				<span>较{{ prevLabel }}{{ increaseData.label }}: </span>
				<span :style="{ color: increaseData.color }">{{ increaseData.num }}</span>
			</p>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { computed } from "vue";

const props = withDefaults( defineProps<{
	/* 数据 */
	data: {
		prev: number;
		next: number;
	};
	/* 数据日期类型 */
	dateType: string;
	/* 数据类型 */
	type: string;
}>(), {
	data: () => ( {
		prev: 0,
		next: 0
	} ),
	dateType: "day",
	type: "primogem"
} );

/* 获取图标 */
const pieceIcon = computed( () => {
	return `https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/ledger/image/item_${ props.type }.png`
} );

const prevLabel = computed( () => {
	return props.dateType === "month" ? "上月" : "昨日";
} );

const nextLabel = computed( () => {
	return props.dateType === "month" ? "本月" : "今日";
} );

/* 较昨日增长相关数据 */
const increaseData = computed( () => {
	const increaseNum = props.data.next - props.data.prev
	return {
		num: Math.abs( increaseNum ),
		color: increaseNum < 0 ? "#91CC75" : "#ffaa0d",
		label: increaseNum < 0 ? "减少" : "增加"
	}
} )
</script>

<style lang="scss" scoped>
.data-piece {
	--piece-border: 1px solid rgba(255, 255, 255, .15);
	display: flex;
	flex-direction: column;
	align-items: center;
	min-width: 250px;
	padding-top: 12px;
	border-radius: 10px;
	border: var(--piece-border);
	color: #fff;

	.icon-box {
		--icon-box-bg: rgba(0, 0, 0, .3);
		width: 78px;
		height: 78px;
		display: flex;
		justify-content: center;
		align-items: center;
		border: var(--piece-border);
		border-radius: 50%;
		box-shadow: 0 0 0 2px var(--icon-box-bg);
		background-color: var(--icon-box-bg);

		> img {
			width: 100%;
		}
	}

	.piece-content {
		width: 100%;
		padding-top: 12px;
		padding-bottom: 20px;
		display: flex;
		align-items: center;
		border-bottom: var(--piece-border);

		> li {
			flex: 1;
			display: flex;
			flex-direction: column;
			align-items: center;

			&.prev-data {
				--data-bg-color: #5d77c9;
			}

			&.next-data {
				--data-bg-color: #ffaa0d;
			}
		}

		> p {
			&:first-child {
				margin-bottom: 18px;
				font-size: 22px;
				line-height: 22px;
			}

			&:last-child {
				padding: 4px 10px;
				border-radius: 10px;
				background-color: var(--data-bg-color);
				font-size: 16px;
				line-height: 16px;
			}
		}
	}

	.piece-footer {
		padding: 16px 0;
		font-size: 20px;
		line-height: 20px;
		text-align: center;
	}
}
</style>