const template =
`<div class="card-footer">
    <img class="background" :src="footerBackground" alt="ERROR"/>
</div>`;

import Vue from "../public/js/vue.js";

export default Vue.defineComponent( {
	name: "CardFooter",
	template,
	setup() {
		const footerBackground = Vue.computed( () => {
			return "http://adachi-bot.oss-cn-beijing.aliyuncs.com/module/card-new-bottom.png";
		} )
		
		return {
			footerBackground
		}
	}
} );