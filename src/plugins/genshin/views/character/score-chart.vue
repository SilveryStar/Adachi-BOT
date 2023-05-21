<script lang="ts" setup>
import { ref, onMounted, computed, Ref } from "vue";
import "echarts";
import VChart from "vue-echarts";
import { EvaluateScore } from "#/genshin/types";

const props = defineProps<{
	data: EvaluateScore;
	color: {
		graphic: string;
		text: string;
	};
}>();

const chartKey = ref( 0 );

const total = 100;

const score = computed( () => props.data.total.toFixed( 2 ) )

const chartOption = ref( {
	animation: false,
	radar: {
		shape: "circle",
		center: [ "50%", "50%" ],
		radius: "65%",
		indicator: props.data.list.map( d => {
			return {
				name: d.label,
				max: total
			}
		} ),
		axisName: {
			color: props.color.text,
			fontSize: 14,
			fontFamily: "GenshinUsedFont, monospace",
			formatter: value => {
				const format = [ "武器等级", "天赋升级" ];
				if ( format.includes( value ) ) {
					const arr = value.split( "" );
					arr.splice( 2, 0, "\n" );
					return arr.join( "" );
				}
				return value;
			},
		},
		axisLine: {
			show: true
		}
	},
	series: [
		{
			type: 'radar',
			areaStyle: {
				color: props.color.graphic,
				opacity: 0.4
			},
			itemStyle: {
				opacity: 0
			},
			lineStyle: {
				color: props.color.graphic,
				opacity: 0.6
			},
			data: [
				{
					value: props.data.list.map( d => d.percentage * total ),
				}
			]
		}
	]
} )

/* 字体加载完毕后刷新e-chart */
const timer: Ref = ref( null );

onMounted( () => {
	timer.value = setInterval( () => {
		if ( document.readyState === "complete" ) {
			chartKey.value++;
			window.clearInterval( timer.value );
			timer.value = null;
		}
	}, 20 )
} );
</script>

<template>
	<div class="score-chart">
		<v-chart class="chart" :key="chartKey" :option="chartOption"></v-chart>
		<p>评分：
			<span class="score" :style="{ color: color.text }">{{ score }}</span>
		</p>
		<p class="desc">*根据等级以及星级评分，仅供娱乐参考</p>
	</div>
</template>

<style lang="scss" scoped>
.score-chart {
	position: relative;
	display: inline-block;
	box-sizing: border-box;
	text-align: center;

	.chart {
		width: 260px;
		height: 180px;
	}

	p {
		margin-top: 10px;
		font-size: 20px;

		.score {
			font-size: 24px;
			text-shadow: 1px 1px 3px #ccc;
		}
	}

	.desc {
		margin-top: 6px;
		font-size: 12px;
		transform: scale(0.8);
	}
}
</style>