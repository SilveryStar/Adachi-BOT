const template =
`<div class="statistic-item">
    <img class="background" :src="background" alt="ERROR"/>
    <img class="main" :src="mainImage" alt="ERROR"/>
    <div class="corner"/>
    <div class="count">{{ data.count }} 次</div>
</div>`;

const { defineComponent, computed } = Vue;

export default defineComponent( {
	name: "StatisticItem",
	template,
	props: {
		data: Object
	},
	setup( props ) {
		const background = computed( () => {
			return `../../public/images/rarity/${ props.data.rank }-Star.png`;
		} );
		const mainImage = computed( () => {
			const type = props.data.type === "角色" ? "character" : "weapon";
			return `https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/thumb/${ type }/${ props.data.name }.png`;
		} );
		
		return {
			background,
			mainImage
		}
	}
} );