const template = `<div class="dashboard">
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
			<el-date-picker class="picker" v-model="currentWeek" type="week" format="第 ww 周" @change="weekChange" />
		</div>
		<div class="chart-box">
    		<div ref="dayChartRef" class="chart"></div>
			<el-date-picker class="picker" v-model="currentDay" format="MM 月 DD 日" disabled />
		</div>
	</div>
</div>`;

import $http from "../api/index.js"

const { defineComponent, onMounted, onUnmounted, reactive, toRefs, nextTick, ref } = Vue;

export default defineComponent( {
	name: "Stat",
	template,
	setup() {
		const weekOption = {
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
		
		const dayOption = JSON.parse( JSON.stringify( weekOption ) );
		
		let weekChart = null, dayChart = null;
		
		const state = reactive( {
			currentWeek: new Date(),
			currentDay: new Date(),
			dailyUsage: [],
			appInfo: [],
			weekChart: null,
			dayChart: null
		} );
		
		
		const weekChartRef = ref( null );
		const dayChartRef = ref( null );
		
		const weekList = [ "周日", "周一", "周二", "周三", "周四", "周五", "周六" ];
		
		onMounted( async () => {
			await getData( new Date() );
			initChart();
			addEventListener( "resize", resizeCharts );
		} );
		
		onUnmounted( () => {
			removeEventListener( "resize", resizeCharts );
			weekChart?.off( "click" );
		} )
		
		/* 获取图表数据 */
		async function getData( date ) {
			const d = new Date( date.setDate(
				state.currentWeek.getDate() - state.currentWeek.getDay()
			) );
			const { data } = await $http.BOT_STAT( { start: d.toJSON() }, "GET" );
			setAppData( data );
			setChartData( data.weakData );
		}
		
		/* 设置基本信息 */
		function setAppData( { cpuUsed, memories, userCount, groupCount } ) {
			state.appInfo = [ {
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
		
		/* 设置表格数据 */
		function setChartData( data ) {
			state.hourlyUsage = [];
			state.dailyUsage = [];
			for ( let u of data ) {
				const subData = u.data;
				const dayID = subData.dayID;
				const tmpSet = [];
				let total = 0;
				for ( let i = 0; i < 24; i++ ) {
					const s = `${ dayID } ${ i + 1 }:00`;
					const find = subData.data.find( el => parseInt( el.hour ) === i );
					
					if ( find ) {
						const o = JSON.parse( find.detail );
						const t = Object.values( o ).reduce( ( pre, cur ) => pre + parseInt( cur ), 0 );
						tmpSet.push( { value: [ s, t, o ] } );
						total += t;
					} else {
						tmpSet.push( { value: [ s, 0, {} ] } );
					}
				}
				state.dailyUsage.push( total );
				state.hourlyUsage.push( tmpSet );
			}
		}
		
		/* 初始化图表 */
		function initChart() {
			initWeekChart();
			initDayChart();
			nextTick( () => resizeCharts() );
		}
		
		/* 初始化 week 图表 */
		function initWeekChart() {
			const chartDom = weekChartRef.value;
			if ( !chartDom ) return
			weekChart = echarts.init( chartDom );
			
			weekOption.title.text = "周指令使用次数";
			weekOption.xAxis.type = "category"
			weekOption.xAxis.data.push( ...weekList );
			weekOption.series[0].data.push( ...getWeekData() );
			
			weekChart?.setOption( weekOption );
			weekChart?.on( "click", dayChange );
		}
		
		/* 初始化 day 图表 */
		function initDayChart() {
			const chartDom = dayChartRef.value;
			if ( !chartDom ) return
			dayChart = echarts.init( chartDom );
			
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
			
			dayChart?.setOption( dayOption );
		}
		
		/* 重新渲染图表 */
		function resizeCharts() {
			weekChart?.resize();
			dayChart?.resize();
		}
		
		/* 获得指定周数据 */
		function getWeekData() {
			return state.dailyUsage;
		}
		
		/* 获取指定日期数据 */
		function getDayData() {
			const d = state.currentDay.getDay();
			return state.hourlyUsage[d];
		}
		
		/* 点击 week图表 切换日期事件 */
		function dayChange( params ) {
			const d = state.currentWeek;
			state.currentDay = new Date(
				d.setDate(
					d.getDate() -
					d.getDay() +
					weekList.findIndex( el => el === params.name )
				) );
			dayOption.series[0].data = getDayData();
			dayChart?.setOption( dayOption );
		}
		
		/* week 图表切换事件 */
		async function weekChange( date ) {
			state.currentDay = date;
			await getData( date );
			weekOption.series[0].data = getWeekData();
			dayOption.series[0].data = getDayData();
			
			weekChart?.setOption( weekOption );
			dayChart?.setOption( dayOption );
		}
		
		return {
			...toRefs( state ),
			weekChartRef,
			dayChartRef,
			dayChange,
			weekChange
		};
	}
} );