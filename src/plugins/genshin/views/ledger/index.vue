<script lang="ts" setup>
import { onMounted, ref, Ref } from "vue";
import $https from "#/genshin/front-utils/api";
import SectionTitle from "#/genshin/components/section-title/index.vue";
import DataPiece from "./data-piece.vue"
import DataChart from "./data-chart.vue"
import { urlParamsGet } from "@/utils/common";

const urlParams = urlParamsGet( location.href );
const data = ref<Record<string, any> | null>( null );
const version = window.ADACHI_VERSION;

function getPieceData( data: Record<string, any> ) {
	return {
		dayMora: {
			prev: data.dayData.lastMora,
			next: data.dayData.currentMora
		},
		dayPrimogems: {
			prev: data.dayData.lastPrimogems,
			next: data.dayData.currentPrimogems
		},
		monthMora: {
			prev: data.monthData.lastMora,
			next: data.monthData.currentMora
		},
		monthPrimogems: {
			prev: data.monthData.lastPrimogems,
			next: data.monthData.currentPrimogems
		}
	}
}

const getData = async () => {
	const res = await $https.LEDGER.get( { uid: urlParams.uid } );
	data.value = {
		...res,
		pieceData: getPieceData( res )
	};
}

onMounted( () => {
	getData();
} );
</script>

<template>
	<div v-if="data" id="app" class="ledger-base">
		<header>
			<article class="user-info">
				<p>UID {{ data.uid }}</p>
				<p>{{ data.nickname }}</p>
			</article>
			<article class="ledger-header">
				<p>旅行者{{ data.dataMonth }}月札记</p>
				<p>*仅统计充值途径以外获取的资源</p>
			</article>
		</header>
		<main>
			<article>
				<section-title>
					<template #default>每日数据</template>
				</section-title>
				<div class="ledger-data-content">
					<data-piece :data="data.pieceData.dayPrimogems" type="primogem" dateType="day"></data-piece>
					<data-piece :data="data.pieceData.dayMora" type="mora" dateType="day"></data-piece>
				</div>
			</article>
			<article>
				<section-title>
					<template #default>每月数据</template>
				</section-title>
				<div class="ledger-data-content">
					<data-piece :data="data.pieceData.monthPrimogems" type="primogem" dateType="month"></data-piece>
					<data-piece :data="data.pieceData.monthMora" type="mora" dateType="month"></data-piece>
				</div>
			</article>
			<article>
				<section-title>
					<template #default>原石来源统计</template>
				</section-title>
				<div class="ledger-data-content">
					<data-chart :data="data.monthData.groupBy"></data-chart>
				</div>
			</article>
			<p class="time">记录日期 {{ data.date }}</p>
		</main>
		<footer>
			<p>Created by Adachi-BOT v{{ version }}</p>
		</footer>
	</div>
</template>

<style src="../../assets/styles/reset.css"></style>

<style lang="scss" scoped>
#app {
	width: 700px;
}

.ledger-base {
	padding: 0 20px;
	position: relative;
	background: url("/assets/genshin/resource/ledger/background/ledger-bg.jpg") center center no-repeat;
	background-size: cover;
	overflow: hidden;
	color: #fff;

	&::before {
		content: "";
		position: absolute;
		left: 0;
		top: 0;
		right: 0;
		bottom: 0;
		background-color: #000;
		opacity: .85;
	}

	> header,
	> main,
	> footer {
		position: relative;
		z-index: 100;
	}

	/* 头部 */
	> header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		padding-top: 20px;
		padding-bottom: 26px;
		opacity: 0.5;

		.user-info {
			> p {
				margin: 0;
				font-size: 16px;
				line-height: 18px;

				&:first-child {
					margin-bottom: 12px;
				}
			}
		}

		.ledger-header {
			> p {
				&:first-child {
					margin-bottom: 10px;
					font-size: 26px;
					line-height: 26px;
					text-align: right;
				}

				&:last-child {
					font-size: 14px;
					line-height: 14px;
					text-align: right;
				}
			}
		}
	}

	/* 主题内容 */
	> main {
		display: flex;
		flex-direction: column;
		align-items: center;
		border-radius: 10px;
		background-color: rgba(255, 255, 255, 0.05);

		.time {
			align-self: flex-end;
			padding: 10px 20px;
			font-size: 12px;
			opacity: 0.5;
		}

		> article {
			width: 100%;

			.ledger-data-content {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 0 24px;

				.data-piece {
					width: 282px;
				}
			}
		}

		/* 重置标题样式 */
		:deep(.section-title) {
			font-size: 24px;
			color: rgba(255, 255, 255, .65);

			&::before,
			&::after {
				background-size: 200%;
			}
		}
	}

	/* 脚部备注 */
	> footer {
		padding: 12px 0;
		font-size: 18px;
		text-align: center;
		color: #fff;
		opacity: 0.4;
	}
}
</style>