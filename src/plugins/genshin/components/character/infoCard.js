const template = `
<div class="info-card">
	<h3 v-if="title">{{ title }}</h3>
	<div class="info-card-content" v-bind="$attrs">
		<slot></slot>
	</div>
</div>
`

const { defineComponent } = Vue;

export default defineComponent( {
	template,
	inheritAttrs: false,
	name: 'InfoCard',
	props: {
		title: String,
	}
} )