const template = `<ul class="reveal">
	<li v-for="(d , dKey) of data" :key="dKey">
		<img :src="getSideIcon(d.avatarId)" alt="ERROR">
		<span>{{ d.value }} 次</span>
	</li>
</ul>`;

const { defineComponent } = Vue;

export default defineComponent( {
	name: "Reveal",
	props: {
		data: {
			type: Array,
			default: () => []
		}
	},
	template,
	setup() {
		const getSideIcon = code => `https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/sides/${ code }.png`;
		return {
			getSideIcon
		};
	}
} )