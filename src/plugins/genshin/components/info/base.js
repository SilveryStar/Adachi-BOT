const template =
`<div class="info-base">
	<img class="background" :src="infoBackground" alt="ERROR"/>
	<img :class="type === '角色' ? 'character' : 'weapon'" :src="mainImage" alt="ERROR"/>
	<div class="content">
        <p class="title-and-name">「{{ title }}·{{ name }}」</p>
        <p class="introduce">{{ introduce }}</p>
    </div>
    <div class="dotted"></div>
</div>`;

import Vue from "../../public/js/vue.js";

export default Vue.defineComponent( {
	name: "InfoApp",
	template,
	props: {
		rarity: Number,
		name: String,
		id: Number,
		type: String,
		title: String,
		introduce: String
	},
	setup( props ) {
		const infoBackground = Vue.computed( () => {
			return `https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/info/other/BaseBackground${ props.rarity }.png`
		} );
		const mainImage = Vue.computed( () => {
			const link = props.type === "角色" ? `character/${ props.id }.png`
											   : `weapon/${ props.name }.png`;
			return `https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/${ link }`;
		} );
		
		return {
			infoBackground,
			mainImage
		}
	}
} );