const template =
`<div class="character-box">
    <img class="element-background" :src="elementBackground" alt="ERROR"/>
    <img class="profile" :src="char.icon" alt="ERROR"/>
    
    <div class="info none-style" v-if="style === 'normal'">
    	<p class="name">{{ char.name }}</p>
        <div class="character-data">
            <p class="constellation">命之座: {{ char.activedConstellationNum }}层</p>
            <p class="level">Lv.{{ char.level }}</p>
            <p class="fetter" v-if="char.name !== '旅行者'">
                ❤{{ char.fetter }}
            </p>
        </div>
	</div>

	<div class="info planA-style" v-else-if="style === 'weaponA'">
		<div class="base">
			<p class="name">{{ char.name }}</p>
			<p class="constellation">C{{ char.activedConstellationNum }}</p>
		</div>
        <div class="character-data">
            <p class="level">Lv.{{ char.level }}</p>
            <p class="fetter" v-if="char.name !== '旅行者'">
                ❤{{ char.fetter }}
            </p>
        </div>
        <CharacterWeapon :weapon="char.weapon"/>
	</div>

	<div class="info planB-style" v-else>
		<p class="name">{{ char.name }}</p>
        <div class="character-data">
            <p class="level">Lv.{{ char.level }}</p>
            <p class="fetter" v-if="char.name !== '旅行者'">
                ❤{{ char.fetter }}
            </p>
        </div>
		<p class="constellation">命之座: {{ char.activedConstellationNum }}层</p>
		<p class="weapon">武器: {{ char.weapon.name }} Lv.{{ char.weapon.level }}</p>
	</div>
</div>`;

import Vue from "../../public/js/vue.js";
import CharacterWeapon from "./character-weapon.js";

export default Vue.defineComponent( {
	name: "CharacterBox",
	template,
	props: {
		char: Object,
		style: String
	},
	components: {
		CharacterWeapon
	},
	setup() {
		const elementBackground = Vue.computed( () => {
			return "https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/module/element.png";
		} );
		return {
			elementBackground
		}
	}
} );