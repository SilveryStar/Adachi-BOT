const template =
`<div class="character-box">
    <img class="element-background" :src="elementBackground" alt="ERROR"/>
    <img class="profile" :src="char.icon" alt="ERROR"/>
    <div class="info">
        <p class="name">{{ char.name }}</p>
        <div class="character-data">
            <p class="constellation">命之座: {{ char.actived_constellation_num }}层</p>
            <p class="level">Lv.{{ char.level }}</p>
            <p class="fetter" v-if="char.name !== '旅行者'">
                ❤{{ char.fetter }}
            </p>
        </div>
    </div>
</div>`;

import Vue from "../public/js/vue.js";

export default Vue.defineComponent( {
	name: "CharacterBox",
	template,
	props: {
		char: Object
	},
	setup() {
		const elementBackground = Vue.computed( () => {
			return "http://adachi-bot.oss-cn-beijing.aliyuncs.com/module/element.png";
		} );
		
		return {
			elementBackground
		}
	}
} );