const template =
`<div class="card-footer">
    <img class="background" :src="footerBackground" alt="ERROR"/>
</div>`;

const { defineComponent, computed } = Vue;

export default defineComponent( {
	name: "CardFooter",
	template,
	setup() {
		const footerBackground = computed( () => {
			return "https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/module/card-bottom.png";
		} )
		
		return {
			footerBackground
		}
	}
} );