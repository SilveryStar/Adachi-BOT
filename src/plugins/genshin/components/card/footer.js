const template =
`<div class="card-footer">
    <img class="background" :src="footerBackground" alt="ERROR"/>
</div>`;

import Vue from "../../public/js/vue.js";

export default Vue.defineComponent( {
	name: "CardFooter",
	template,
	setup() {
		const footerBackground = Vue.computed( () => {
			return "https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/module/card-bottom.png";
		} )
		
		return {
			footerBackground
		}
	}
} );