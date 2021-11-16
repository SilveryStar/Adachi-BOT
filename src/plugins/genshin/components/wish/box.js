const template =
`<div class="wish-box">
    <img class="box-background" :src="boxBackground" alt="ERROR"/>
    <div class="character" v-if="d.type === '角色'">
        <img class="type" :src="typeIcon" alt="ERROR"/>
        <img class="main" :src="mainImage" alt="ERROR"/>
    </div>
    <div class="weapon" v-else>
        <img class="main" :src="mainImage" alt="ERROR"/>
        <img class="main shadow" :src="mainImage" alt="ERROR"/>
        <img class="type" :src="typeIcon" alt="ERROR"/>
    </div>
    <p class="times" v-if="d.rank === 5">
        「{{ d.times }}抽」
    </p>
    <img class="rank" :src="rankIcon" alt="ERROR"/>
</div>`;

const { defineComponent, computed } = Vue;

export default defineComponent( {
	name: "WishBox",
	template,
	props: {
		d: Object
	},
	setup( props ) {
		function toString( num ) {
			switch ( num ) {
				case 5: return "Five";
				case 4: return "Four";
				case 3: return "Three";
			}
		}
		
		const boxBackground = computed( () => {
			return `../../public/images/item/${ toString( props.d.rank ) }Background.png`;
		} );
		const mainImage = computed( () => {
			const type = props.d.type === "武器" ? "weapon" : "character";
			return `https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/wish/${ type }/${ props.d.name }.png`;
		} );
		const typeIcon = computed( () => {
			const type = props.d.type === "武器" ? "type" : "element";
			return `../../public/images/${ type }/${ props.d.el }.png`;
		} );
		const rankIcon = computed( () => {
			return `../../public/images/item/${ toString( props.d.rank ) }Star.png`;
		} );
		
		return {
			boxBackground,
			mainImage,
			typeIcon,
			rankIcon
		}
	}
} )