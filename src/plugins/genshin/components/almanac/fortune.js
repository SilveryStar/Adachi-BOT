const template =
`<div class="almanac-fortune" :class="{ top: isTop }">
	<div class="fortune-type">
		{{ isTop ? "宜" : "忌" }}
	</div>
	<div class="list">
		<div class="item"  v-for="d in data">
			<p class="name">{{ d.name }}</p>
			<p class="desc">{{ d.desc }}</p>
		</div>
	</div>
</div>`;

const { defineComponent } = Vue;

export default defineComponent( {
	name: "AlmanacFortune",
	template,
	props: {
		data: Object,
		isTop: Boolean
	}
} );