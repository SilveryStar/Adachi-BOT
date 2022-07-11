const template = `<header class="header">
	<div class="container">
		<span class="time">{{ timeStr }}</span>
		<span class="title">今日素材/活动日历</span>
		<span class="author">Created by Adachi-BOT</span>
	</div>
</header>
`

const { defineComponent, computed } = Vue;

export default defineComponent( {
	name: "DailyHeader",
	template,
	setup() {
		const timeStr = computed( () => moment().locale( "zh-cn" ).format( "MM/DD HH:mm dddd" ) );
		
		return {
			timeStr
		}
	}
} )