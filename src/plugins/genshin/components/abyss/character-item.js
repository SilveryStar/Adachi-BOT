const template =
`<div class="character-item">
	<img class="background" :src="starBackground" alt="ERROR"/>
	<img class="main" :src="char.icon" alt="ERROR"/>
	<div class="corner"></div>
	<span class="level">{{ str }}</span>
</div>`;

const { defineComponent, computed } = Vue;

export default defineComponent( {
	name: "CharacterItem",
	template,
	props: {
		char: Object,
		str: String
	},
	setup( props ) {
		const starBackground = computed( () => {
			let star = props.char.rarity;
			return `../../public/images/rarity/${ star }-Star.png`;
		} );
		
		return {
			starBackground
		}
	}
} );