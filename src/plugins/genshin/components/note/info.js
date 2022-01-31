const template = `<div class="info box">
	<img :src="data.icon" alt="ERROR" />
	<div class="text">
		<p class="info-title">{{ data.title }}</p>
		<p class="info-subtitle">{{ data.subtitle }}</p>
	</div>
	<p class="data" :class="{ mini: data.miniFontSize }">{{ data.numerator }}/{{ data.denominator }}</p>
</div>`;

const { defineComponent } = Vue;

export default defineComponent({
	name: "NoteInfo",
	template,
	props: {
		data: Object,
	},
});
