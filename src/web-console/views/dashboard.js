const template =
`<div class="stat-page">
	<div class="week-stat">
		<el-date-picker
			class="picker"
			v-model="curWeek"
			type="week"
			format="第 ww 周"
			@change="dateChange"
		/>
		<v-chart
			class="week-chart chart"
			:option="weekOption"
			:autoresize="true"
			@click="changeDay"
		/>
	</div>
	<div class="day-stat">
		<el-date-picker
			class="picker"
			v-model="curDay"
			format="MM 月 DD 日"
			readonly
		/>
		<v-chart class="day-chart chart" :option="dayOption" :autoresize="true"/>
	</div>
</div>`;

import $http from "../api/index.js"

const { defineComponent, onMounted, reactive, toRefs, nextTick } = Vue;

export default defineComponent( {
	name: "Stat",
	template,
	setup() {
		const baseOption = {
			title: {
				text: "",
				left: "center"
			},
			color: "#20a53a",
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
				symbolSize: 7,
				smooth: true,
				emphasis: {
					lineStyle: { width: 2 }
				},
				data: []
			} ]
		};
		const state = reactive( {
			weekOption: baseOption,
			dayOption: JSON.parse( JSON.stringify( baseOption ) ),
			curWeek: null,
			curDay: null,
			dateset: null,
			total: []
		} );
		const weekList = [ "周日", "周一", "周二", "周三", "周四", "周五", "周六" ];
		
		function resize() {
			const week = document.getElementsByClassName( "week-chart" )[0];
			const day = document.getElementsByClassName( "day-chart" )[0];
			const width = week.getBoundingClientRect().width;
			const height = width * 0.75 + "px";
			week.style.height = height;
			day.style.height = height;
		}
		
		function getWeekData() {
			return state.total;
		}
		
		function initWeekChart() {
			state.weekOption.xAxis.type = "category"
			state.weekOption.xAxis.data.push( ...weekList );
			state.weekOption.title.text = "";
			state.weekOption.series[0].data.push( ...getWeekData() );
		}
		
		function getDayData() {
			const d = state.curDay.getDay();
			return state.dataset[d];
		}
		
		function initDayChart() {
			state.dayOption.xAxis.type = "time";
			state.dayOption.series[0].data.push( ...getDayData() );
			state.dayOption.tooltip.formatter = function ( params ) {
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
		}
		
		function initChart() {
			initWeekChart();
			initDayChart();
			addEventListener( "resize", () => resize() );
			nextTick( () => resize() );
		}
		
		async function getData( date ) {
			const d = new Date( date.setDate(
				state.curWeek.getDate() - state.curWeek.getDay()
			) );
			const resp = await $http.BOT_STAT( {
				start: d.toJSON()
			}, "GET" );
			state.dataset = [];
			state.total = [];
			for ( let u of resp.data ) {
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
				state.total.push( total );
				state.dataset.push( tmpSet );
			}
		}
		
		function changeDay( params ) {
			const d = state.curWeek;
			state.curDay = new Date(
				d.setDate(
					state.curWeek.getDate() -
					state.curWeek.getDay() +
					weekList.findIndex( el => el === params.name )
			) );
			state.dayOption.series[0].data = getDayData();
		}
		
		async function dateChange( date ) {
			state.curDay = date;
			await getData( date );
			state.weekOption.series[0].data = getWeekData();
			state.dayOption.series[0].data = getDayData();
		}
		
		onMounted( async () => {
			state.curDay = new Date();
			state.curWeek = new Date();
			await getData( new Date() );
			initChart()
		} );
		
		return {
			...toRefs( state ),
			changeDay,
			dateChange
		};
	}
} );