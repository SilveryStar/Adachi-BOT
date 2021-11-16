const template =
`<div class="character-list">
	<CharacterItem v-for="char in chars" :char="char" :str="getStr( char )"/>
</div>`;

import CharacterItem from "./character-item.js";
const { defineComponent } = Vue;

export default defineComponent( {
	name: "CharacterList",
	template,
	components: {
		CharacterItem
	},
	props: {
		chars: Array,
		type: String
	},
	setup( props ) {
		const getStr = function( char )  {
			return props.type === "level"
				? "Lv." + char.level
				: char.value + "次"
		};
		
		return { getStr }
	}
} );