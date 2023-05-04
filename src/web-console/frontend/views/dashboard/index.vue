<template>
	<div class="table-container no-background dashboard">
		<ul class="app-info-container">
			<li class="app-info-item" v-for="(i, iKey) of appInfo" :key="iKey">
				<div class="info-item-content">
					<div class="item-icon">
						<i :class="i.icon"></i>
					</div>
					<div class="item-info">
						<p class="item-label">{{ i.label }}</p>
						<p class="item-value" :class="{ special: i.special }">{{ i.value }}</p>
					</div>
				</div>
			</li>
		</ul>
		<div class="chart-container">
			<div class="chart-box">
				<div ref="weekChartRef" class="chart"></div>
				<el-date-picker class="picker" v-model="currentWeek" type="week" format="第 ww 周"
				                @change="weekChange"/>
			</div>
			<div class="chart-box">
				<div ref="dayChartRef" class="chart"></div>
				<el-date-picker class="picker" v-model="currentDay" format="MM 月 DD 日" disabled/>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import $http from "&/api";
import * as echarts from "echarts";
import { onMounted, onUnmounted, reactive, nextTick, ref } from "vue";
import { WeekData } from "@/web-console/backend/routes/base";

interface HourlyUsageItem {
	value: [ string, number, Record<string, string> ]
}

const defaultOption = {
	title: {
		text: "",
		left: "center"
	},
	color: "#A6CEE3",
	xAxis: {
		type: "",
		data: [],
		boundaryGap: [ 0, "5%" ],
		axisLine: {
			symbol: [ "none", "arrow" ]
		}
	},
	yAxis: {
		type: "value",
		boundaryGap: [ 0, "10%" ],
		name: "次数",
		axisLine: {
			show: true,
			symbol: [ "none", "arrow" ]
		}
	},
	grid: {
		right: "3%",
		left: "3%",
		bottom: "3%",
		containLabel: true
	},
	tooltip: {
		trigger: "axis",
		axisPointer: {
			type: "cross",
			snap: true
		}
	},
	series: [ {
		type: "line",
		symbol: "circle",
		symbolSize: 10,
		smooth: true,
		emphasis: {
			lineStyle: { width: 2 }
		},
		data: []
	} ]
};

const weekList: string[] = [ "周日", "周一", "周二", "周三", "周四", "周五", "周六" ];

const appInfo = ref<Array<{
	label: string;
	icon: string;
	value: string;
	special?: boolean;
}>>( [] );

/* 设置基本信息 */
function setAppData( { cpuUsed, memories, userCount, groupCount } ) {
	appInfo.value = [ {
		label: "CPU利用率",
		icon: "icon-cpu",
		value: cpuUsed
	}, {
		label: "内存使用率",
		icon: "icon-memories",
		value: `${ memories.usedMem }/${ memories.totalMem }`,
		special: true
	}, {
		label: "用户数量",
		icon: "icon-user",
		value: userCount
	}, {
		label: "群组数量",
		icon: "icon-group",
		value: groupCount
	} ]
}

const dailyUsage = ref<number[]>( [] );
const hourlyUsage = ref<HourlyUsageItem[][]>( [] );

/* 设置表格数据 */
function setChartData( data: WeekData[] ) {
	hourlyUsage.value = [];
	dailyUsage.value = [];
	for ( let u of data ) {
		const subData = u.data;
		const dayID: string = subData.dayID;
		const tmpSet: HourlyUsageItem[] = [];
		let total: number = 0;
		for ( let i = 0; i < 24; i++ ) {
			const s: string = `${ dayID } ${ i + 1 }:00`;
			const find = subData.data.find( el => parseInt( el.hour ) === i );

			if ( find ) {
				const o: Record<string, string> = JSON.parse( find.detail );
				const t: number = <number>Object.values( o ).reduce( ( pre, cur ) => pre + parseInt( cur ), 0 );
				tmpSet.push( { value: [ s, t, o ] } );
				total += t;
			} else {
				tmpSet.push( { value: [ s, 0, {} ] } );
			}
		}
		dailyUsage.value.push( total );
		hourlyUsage.value.push( tmpSet );
	}
}

/* 获得指定周数据 */
function getWeekData() {
	return dailyUsage.value;
}

/* 获取指定日期数据 */
function getDayData() {
	const d = currentDay.value.getDay();
	return hourlyUsage.value[d];
}

const weekChart = ref<echarts.EChartsType | null>( null );
const weekOption = reactive<any>( JSON.parse( JSON.stringify( defaultOption ) ) );
const weekChartRef = ref<HTMLDivElement | null>( null );

/* 初始化 week 图表 */
function initWeekChart() {
	const chartDom = weekChartRef.value;
	if ( !chartDom ) return
	weekChart.value = echarts.init( chartDom );

	weekOption.title.text = "周指令使用次数";
	weekOption.xAxis.type = "category"
	weekOption.xAxis.data.push( ...weekList );
	weekOption.series[0].data.push( ...getWeekData() );

	weekChart.value?.setOption( weekOption );
	weekChart.value?.on( "click", dayChange );
}

const dayChart = ref<echarts.EChartsType | null>( null );
const dayOption = reactive<any>( JSON.parse( JSON.stringify( defaultOption ) ) );
const dayChartRef = ref<HTMLDivElement | null>( null );

/* 初始化 day 图表 */
function initDayChart() {
	const chartDom = dayChartRef.value;
	if ( !chartDom ) return
	dayChart.value = echarts.init( chartDom );

	dayOption.title.text = "当日指令使用详情";
	dayOption.xAxis.type = "time";
	dayOption.series[0].data.push( ...getDayData() );
	dayOption.tooltip.formatter = function ( params ) {
		const [ , t, o ] = params[0].value;
		const left = `<div style="display: inline-block">${
			Object.keys( o ).map( el => `<p>${ el }</p>` ).join( "" )
		}</div>`;
		const right = `<div style="display: inline-block; margin-left: 8px; font-weight: 500; color:#000;">${
			Object.values( o ).map( el => `<p>${ el }</p>` ).join( "" )
		}</div>`;
		return `<div style="font-family: Consolas, '宋体', monospace; font-size: 13px"><p style="color:#000; font-weight: 800;">总数 <span style="margin-left: 4px;">${
			t
		}</span></p>${ t === 0 ? "" : `${ left }${ right }` }</div>`;
	}

	dayChart.value?.setOption( dayOption );
}

const currentWeek = ref<Date>( new Date() );

/* 获取图表数据 */
async function getData( date: Date ) {
	const d: Date = new Date( date.setDate(
		currentWeek.value.getDate() - currentWeek.value.getDay()
	) );
	const { data } = await $http.BOT_STAT.get( { start: d.toJSON() } );
	setAppData( data );
	setChartData( data.weakData );
}

const currentDay = ref<Date>( new Date() );

/* week 图表切换事件 */
async function weekChange( date ) {
	currentDay.value = date;
	await getData( date );
	weekOption.series[0].data = getWeekData();
	dayOption.series[0].data = getDayData();

	weekChart.value?.setOption( weekOption );
	dayChart.value?.setOption( dayOption );
}

/* 点击 week图表 切换日期事件 */
function dayChange( params ) {
	const d = currentWeek.value;
	currentDay.value = new Date(
		d.setDate(
			d.getDate() -
			d.getDay() +
			weekList.findIndex( el => el === params.name )
		) );
	dayOption.series[0].data = getDayData();
	dayChart.value?.setOption( dayOption );
}

/* 重新渲染图表 */
function resizeCharts() {
	weekChart.value?.resize();
	dayChart.value?.resize();
}

/* 初始化图表 */
function initChart() {
	initWeekChart();
	initDayChart();
	nextTick( () => resizeCharts() );
}

onMounted( async () => {
	await getData( new Date() );
	initChart();
	addEventListener( "resize", resizeCharts );
} );

onUnmounted( () => {
	removeEventListener( "resize", resizeCharts );
	weekChart.value?.off( "click" );
} )
</script>

<style lang="scss" scoped>
/* 基本信息 */
.dashboard {
	> .app-info-container {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		> .app-info-item {
			width: 25%;
			height: 120px;
			margin: 10px 0;
			padding: 0 15px;
			box-sizing: border-box;

			> .info-item-content {
				display: flex;
				align-items: center;
				height: 100%;
				padding: 0 10px;
				border-radius: 4px;
				box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
				background-color: #fff;

				> .item-icon {
					display: flex;
					justify-content: center;
					align-items: center;
					margin-left: 6%;
					width: 60px;
					height: 60px;
					border-radius: 50%;
					background-color: var(--base-color);
					font-size: 32px;
					color: #fff;
					flex-shrink: 0;
				}

				> .item-info {
					margin-left: 8%;

					> .item-label {
						font-size: 18px;
						line-height: 22px;
						font-weight: 500;
						color: #666;
					}

					> .item-value {
						margin-top: 10px;
						font-weight: 700;
						font-size: 18px;
						line-height: 24px;
						color: #333;
					}

					> .item-value.special {
						font-size: 14px;
					}
				}
			}
		}

	}
	/* 图表 */
	> .chart-container {
		margin-top: 28px;
		display: flex;
		flex-wrap: wrap;

		> .chart-box {
			--picker-height: 32px;
			width: calc(50% - 30px);
			margin: 0 15px;
			padding: 20px;
			height: 500px;
			border-radius: 4px;
			box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
			background-color: #fff;
			text-align: center;
			box-sizing: border-box;

			> .chart {
				width: 100%;
				height: calc(100% - var(--picker-height));
			}

			> :deep(.picker) {
				--el-input-height: var(--picker-height);

				.el-input__wrapper {
					box-shadow: none;
					background-color: transparent;
					font-size: 15px;
				}

				.el-input__inner {
					font-weight: 800;
					text-align: center;
					color: #333;
					cursor: pointer;
				}

				&.is-disabled {
					cursor: auto;

					.el-input__inner {
						cursor: auto;
					}
				}

				.el-input__prefix,
				.el-input__suffix {
					display: none;
				}
			}
		}
	}
}

@media (max-width: 1300px) {
	.dashboard {
		> .app-info-container {
			> .app-info-item {
				margin: 6px 0;
				padding: 0 8px;
				height: 100px;
				width: 50%;

				> .info-item-content {
					> .item-icon {
						width: 52px;
						height: 52px;
						font-size: 28px;
					}
				}
			}
		}

		> .chart-container {
			margin-top: 14px;

			> .chart-box {
				margin: 6px 8px;
				padding: 10px;
				width: 100%;
				height: 380px;
			}
		}
	}
}

@media (max-width: 520px) {
	.dashboard {
		> .chart-container {
			margin-top: 5px;

			> .chart-box {
				margin: 5px 0;
				padding: 8px;
				width: 100%;
				height: 320px;
			}
		}

		> .app-info-container {
			> .app-info-item {
				margin: 5px 0;
				padding: 0;
				height: 60px;
				width: 100%;

				> .info-item-content {
					> .item-icon {
						margin-left: 10px;
						width: 36px;
						height: 36px;
						font-size: 20px;
					}

					> .item-info {
						> .item-label {
							font-size: 14px;
							line-height: 16px;
						}

						> .item-value {
							margin-top: 4px;
							font-size: 14px;
							line-height: 16px;
						}
					}
				}
			}
		}
	}
}
</style>