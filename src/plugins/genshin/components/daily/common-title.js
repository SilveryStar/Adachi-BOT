const template = `<div class="common-title">
	<img v-if="data.icon" :src="data.icon" alt="ERROR" class="icon">
	<div class="title">{{ data.title }}</div>
</div>`

const { defineComponent } = Vue;

export default defineComponent( {
	name: "CommonTile",
	template,
	props: {
		data: {
			type: Object,
			default: {
				icon: "",
				title: ""
			}
		}
	}
} )