const template =
`<div class="data-row" :class="line % 2 === 1 ? 'tagged' : ''">
	<span class="data-title">{{ title }}:</span>
	<div class="list">
		<div class="data-item" v-for="d in data">
			<img class="side-icon" :src="d.avatarIcon" alt="ERROR"/>
			<span class="data-num">{{ d.value }}</span>
		</div>
	</div>
</div>`;

const { defineComponent } = Vue;

export default defineComponent( {
	name: "DataRow",
	template,
	props: {
		title: String,
		data: Object,
		line: Number
	}
} );