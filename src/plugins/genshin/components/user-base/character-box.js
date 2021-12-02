const template =
`<div class="character-box">
	<img class="background" :src="starBackground" alt="ERROR"/>
	<img class="element" :src="element" alt="ERROR"/>
	<img class="main" :src="data.icon" alt="ERROR"/>
	<div class="corner"></div>
	<div class="char-info">
		<span class="level">Lv.{{ data.level }}</span>
		<span class="fetter">❤{{ data.fetter }}</span>
	</div>
</div>`;

const { defineComponent, computed } = Vue;

export default defineComponent( {
	name: "CharacterBox",
	template,
	props: {
		data: Object
	},
	setup( props ) {
		const starBackground = computed( () => {
			const star = props.data.rarity;
			return `../../public/images/rarity/${ star }-Star.png`;
		} );
		const element = computed( () => {
			const el = props.data.element.toLowerCase();
			return `../../public/images/element/${ el }.png`;
		} );
		
		return {
			starBackground,
			element
		}
	}
} );