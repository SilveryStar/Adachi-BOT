const template = `<div class="room">
	<header class="room-header">
		<span class="room-title">第{{ ["一", "二", "三"][data.index - 1] }}间</span>
		<span class="room-date">{{ stamp2date }}</span>
	</header>
	<article class="room-content">
		<ul class="chara-list">
			<li v-for="(b, bKey) of data.battles">
				<div v-for="(c, cKey) of b.avatars" :key="cKey" class="chara-box">
					<span>{{ c.level }}</span>
					<img :src="getSideIcon(c.id)" alt="ERROR">
				</div>
			</li>
		</ul>
		<div class="star-box">
			<img v-for="(s, sKey) of data.maxStar" :key="sKey" :class="{'star-crush': s > data.star}" src="https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/abyss/star.png" alt="ERROR" />
		</div>
	</article>
</div>`;

const { defineComponent, computed } = Vue;

export default defineComponent( {
	name: "Room",
	props: {
		data: {
			type: Object,
			default: () => ( {} )
		}
	},
	template,
	setup( props ) {
		const stamp2date = computed( () => {
			const date = new Date( parseInt( props.data.battles[0].timestamp ) * 1000 );
			return date.toLocaleDateString().replace( /\//g, "-" ) + " " + date.toTimeString().split( " " )[0];
		} );
		
		const getSideIcon = code => `https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/sides/${ code }.png`;
		
		return {
			stamp2date,
			getSideIcon
		};
	}
} )