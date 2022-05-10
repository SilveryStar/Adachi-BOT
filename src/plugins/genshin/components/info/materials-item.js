const template = `<div class="materials-item">
	<img class="material-icon" :src="icon" alt="ERROR"/>
	<p v-if="title" class="materials-title">{{ title }}</p>
</div>`;

const { defineComponent, computed } = Vue;

export default defineComponent( {
	name: "MaterialsItem",
	template,
	props: {
		name: {
			type: String,
			required: true
		},
		showTitle: {
			type: Boolean,
			default: false
		}
	},
	setup(props) {
		
		const name = props.name;
		const showTitle = props.showTitle;
		
		const icon = computed(() => {
			return `https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/info/image/${ name }.png`;
		})
		
		const title = computed(() => {
			if ( !showTitle ) return "";
			const result = name.match(/「(.+)」.+/);
			return result ? result[1] : "";
		})
		
		return {
			icon,
			title
		}
	}
} );
