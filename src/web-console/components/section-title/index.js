const template = `<div class="section-title">
	<h3>{{ title }}</h3>
	<span v-if="desc" class="desc">{{ desc }}</span>
	<div class="append">
		<slot />
	</div>
</div>`;

const { defineComponent } = Vue;

export default defineComponent( {
	name: "SectionTitle",
	template,
	components: {},
	props: {
		title: {
			type: String,
			default: ""
		},
		desc: {
			type: String,
			default: ""
		}
	},
	setup() {
		return {};
	}
} )
