const template =
`<div class="character-base">
    <div class="background">
        <p class="author">Created by Adachi-BOT</p>
        <div class="pure-box"></div>
        <div class="transparent-box"></div>
        
        <p class="title artifact-title">圣遗物</p>
        <div class="split artifact-split"></div>
        
        <p class="title weapon-title">武器</p>
        <div class="split weapon-split"></div>
        
        <img class="portrait" :src="charImage" alt="ERROR"/>
        <p class="uid">UID: {{ uid }}</p>
    </div>
    <div class="info">
        <div class="left">
            <p class="name">{{ name }}</p>
            <p class="element">{{ element }}</p>
        </div>
        <div class="right">
            <p class="level">Lv.{{ level }}</p>
            <p class="constellation">命之座层数: {{ constellationCN }}</p>
            <p class="fetter">好感度: {{ fetterCN }}</p>
        </div>
    </div>
</div>`;

import Vue from "../../public/js/vue.js";

export default Vue.defineComponent( {
	name: "CharacterBase",
	template,
	props: {
		uid: String,
		name: String,
		element: String,
		level: Number,
		constellation: Number,
		fetter: Number,
		id: Number
	},
	setup( props ) {
		const traditional = [ "零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖", "拾" ];
		
		const constellationCN = Vue.computed( () => {
			return traditional[props.constellation];
		} );
		const fetterCN = Vue.computed( () => {
			return traditional[props.fetter];
		} );
		const charImage = Vue.computed( () => {
			return `http://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/character/${ props.id }.png`;
		} );
		
		return {
			constellationCN,
			fetterCN,
			charImage
		}
	}
} );