const template =
`<div class="card-middle">
    <div class="character-line" v-for="charLineData in characters">
        <CharacterBox v-for="char in charLineData"
            :char="char"
        ></CharacterBox>
        <img class="background" :src="middleBackground" alt="ERROR"/>
    </div>
</div>`;

import Vue from "../../public/js/vue.js";
import CharacterBox from "./character-box.js";

export default Vue.defineComponent( {
	name: "CardMiddle",
	template,
	components: {
		CharacterBox
	},
	props: {
		characters: Array
	},
	setup() {
		const middleBackground = Vue.computed( () => {
			return "https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/module/card-middle.png";
		} )
		
		return {
			middleBackground
		}
	}
} );