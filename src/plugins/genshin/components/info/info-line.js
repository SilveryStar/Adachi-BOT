const template = `<div class="info-line" :style="cardStyle" :class="direction">
    <h3 class="line-title">{{ title }}</h3>
    <ul class="line-content">
    	<li v-for="(d, dKey) of data" :key="dKey">
    		<div v-for="label of Object.keys(d)" :key="label" class="item-data">
    			<span>{{ label }}</span>
    			<span>{{ d[label] || '未知' }}</span>
			</div>
		</li>
	</ul>
</div>`;

const { defineComponent } = Vue;

export default defineComponent( {
	name: "InfoLine",
	template,
	props: {
		title: {
			type: String,
			default: "卡片标题"
		},
		width: {
			type: String,
			default: "362px"
		},
		data: {
			type: Array,
			default: () => []
		}
	}
} );
