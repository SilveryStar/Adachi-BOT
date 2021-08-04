const template = `
<div class="abyss-char-box">
    <img class="rarity-background" :src="rarityBackground" alt="ERROR"/>
    <img class="avatar" :src="char.avatar_icon" alt="ERROR"/>
    <span class="info"> {{ char.value }} 次 </span>
</div>`;

import Vue from "../public/js/vue.js";

export default Vue.defineComponent( {
	name: "AbyssCharBox",
	template,
	props: {
		char: Object
	},
	setup( props ) {
		const rarityBackground = Vue.computed( () => {
			return "/public/images/abyss/rarity" + props.char.rarity + ".png";
		} );
		
		return {
			rarityBackground
		}
	}
} );
