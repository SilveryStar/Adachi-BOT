const template =
`<div class="item-list">
    <p class="title">{{ title }}</p>
    <div class="list">
    	<img class="item" v-for="el in arr" :src="icon(el)" alt="ERROR"/>
    </div>
</div>`;

import Vue from "../../public/js/vue.js";

export default Vue.defineComponent( {
	name: "ItemList",
	template,
	props: {
		title: String,
		arr: Array
	},
	setup() {
		function icon( name ) {
			return `https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/info/image/${ name }.png`
		}
		
		return {
			icon
		}
	}
} );