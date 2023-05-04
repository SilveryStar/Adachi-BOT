<template>
	<div class="data-chart">
		<VChart class="chart" :option="chartOption" :key="chartKey"></VChart>
	</div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from "vue";
import "echarts";
import VChart from "vue-echarts";

const props = withDefaults( defineProps<{
	data: Record<string, any>;
}>(), {
	data: () => ({})
} );

const chartKey = ref( 0 );

const chartOption = computed(() => ({
	animation: false,
	legend: {
		orient: "vertical",
		left: 380,
		top: "center",
		align: "left",
		data: props.data.map( d => `${ d.action } ${ d.percent }%` ),
		icon: "rect",
		itemWidth: 15,
		itemHeight: 15,
		textStyle: {
			color: "#fff",
		}
	},
	textStyle: {
		color: "#fff",
		fontFamily: "GenshinUsedFont, monospace"
	},
	series: [
		{
			type: "pie",
			right: 200,
			data: props.data.map( d => {
				return {
					name: `${ d.action } ${ d.percent }%`,
					value: d.num
				}
			} ),
			radius: [ "60%", "75%" ],
			label: {
				show: false
			}
		}
	]
}) )

/* 字体加载完毕后刷新e-chart */
const timer = ref<any>( null );

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

<style lang="scss" scoped>
.data-chart {
	--chart-border: 1px solid rgba(255, 255, 255, .15);
	width: 100%;
	border-radius: 10px;
	border: var(--chart-border);
}

.chart {
	height: 240px;
}
</style>