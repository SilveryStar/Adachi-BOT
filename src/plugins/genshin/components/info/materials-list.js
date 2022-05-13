const template = `<div class="materials-list">
	<div v-if="data.label" class="list-label">{{ data.label }}</div>
	<div class="list-data">
		<materials-item v-for="(m, mKey) of data.value" :key="mKey" :name="m" :showTitle="data.showTitle"></materials-item>
	</div>
</div>`;

import MaterialsItem from "./materials-item.js"

const { defineComponent } = Vue;

export default defineComponent( {
	name: "MaterialsList",
	template,
	components: {
		MaterialsItem,
	},
	props: {
		data: {
			type: Array,
			default: () => []
		}
	},
	setup() {
		function icon( name ) {
			return `https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/info/image/${ name }.png`;
		}
		
		return {
			icon
		}
	}
} );
