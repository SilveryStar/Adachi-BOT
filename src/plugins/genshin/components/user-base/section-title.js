const template =
`<div class="section-title">
	<div class="title">
		<img class="icon" src="https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/module/user-base-title-icon.png" alt="ERROR"/>
		<span class="content">{{ title }}</span>
	</div>
	<img class="split-line" src="https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/module/user-base-split-line.png" alt="ERROR"/>
</div>`;

const { defineComponent } = Vue;

export default defineComponent( {
	name: "SectionTitle",
	template,
	props: {
		title: String
	}
} );