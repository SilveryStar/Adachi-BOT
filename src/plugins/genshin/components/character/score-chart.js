const template = `<div class="score-chart">
	<v-chart class="chart" :key="chartKey" :option="chartOption"></v-chart>
	<p>评分：
		<span class="score" :style="{ color: color.text }">{{ score }}</span>
	</p>
	<p class="desc">*根据等级以及星级评分，仅供娱乐参考</p>
</div>`

const { defineComponent, ref, onMounted, computed } = Vue;

export default defineComponent( {
	name: "DataChart",
	template,
	props: {
		data: {
			type: Array,
			default: () => []
		},
		color: {
			type: String,
			default: () => ( {
				graphic: "#333",
				text: "#333"
			} )
		}
	},
	setup( props ) {
		const data = props.data;
		const chartKey = ref( 0 );
		
		const total = 100;
		
		const score = computed( () => data.total.toFixed( 2 ) )
		
		const chartOption = ref( {
			animation: false,
			radar: {
				shape: "circle",
				center: [ "50%", "50%" ],
				radius: "65%",
				indicator: data.list.map( d => {
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
							value: data.list.map( d => d.percentage * total ),
						}
					]
				}
			]
		} )
		
		/* 字体加载完毕后刷新e-chart */
		const timer = ref( null );
		
		onMounted( () => {
			timer.value = setInterval( () => {
				if ( document.readyState === "complete" ) {
					chartKey.value++;
					window.clearInterval( timer.value );
					timer.value = null;
				}
			}, 20 )
		} );
		
		return {
			score,
			chartKey,
			chartOption
		}
	}
} )