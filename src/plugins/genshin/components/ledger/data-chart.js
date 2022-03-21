const template = `<div class="data-chart">
	<v-chart class="chart" :option="chartOption"></v-chart>
</div>`

const { defineComponent, ref } = Vue;

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
		const data = props.data
		
		const chartOption = ref( {
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
					},
					animationDuration: 80
				}
			]
		} )
		
		return {
			chartOption
		}
	}
} )