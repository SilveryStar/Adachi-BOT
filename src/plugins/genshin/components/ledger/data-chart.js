const template = `<div class="data-chart">
	<v-chart class="chart" :option="chartOption" :key="chartKey"></v-chart>
</div>`

const { defineComponent, ref, onMounted } = Vue;

export default defineComponent( {
	name: "DataChart",
	template,
	props: {
		data: {
			type: Array,
			default: () => []
		}
	},
	setup( props ) {
		const data = props.data;
		const chartKey = ref( 0 );
		
		const chartOption = ref( {
			animation: false,
			legend: {
				orient: "vertical",
				left: 380,
				top: "center",
				align: "left",
				data: data.map( d => `${ d.action } ${ d.percent }%` ),
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
					data: data.map( d => {
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
			chartKey,
			chartOption
		}
	}
} )