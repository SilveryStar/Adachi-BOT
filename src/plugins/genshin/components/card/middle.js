const template =
`<div class="card-middle">
    <div class="character-line" v-for="charLineData in characters">
        <CharacterBox v-for="char in charLineData"
            :char="char"
            :style="style"
        ></CharacterBox>
        <img class="background" :src="middleBackground" alt="ERROR"/>
    </div>
</div>`;

import CharacterBox from "./character-box.js";
const { defineComponent, computed } = Vue;

export default defineComponent( {
	name: "CardMiddle",
	template,
	components: {
		CharacterBox
	},
	props: {
		characters: Array,
		style: String
	},
	setup() {
		const middleBackground = computed( () => {
			return "https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/module/card-middle.png";
		} )
		
		return {
			middleBackground
		}
	}
} );