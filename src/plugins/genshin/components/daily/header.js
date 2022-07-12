const template = `<header class="header">
	<div class="container">
		<span v-if="showEvent" class="time">{{ timeStr }}</span>
		<span class="title">{{ title }}</span>
		<span v-if="showEvent" class="author">Created by Adachi-BOT</span>
	</div>
</header>
`

const { defineComponent, computed } = Vue;

export default defineComponent( {
	name: "DailyHeader",
	template,
	props: {
		week: {
			type: String,
			default: "today"
		},
		showEvent: {
			type: Boolean,
			default: true
		}
	},
	setup( props ) {
		const timeStr = computed( () => moment().locale( "zh-cn" ).format( "MM/DD HH:mm dddd" ) );
		const weekList = [ "日", "一", "二", "三", "四", "五", "六" ];
		
		const title = computed( () => {
			if ( props.week === "today" ) return "今日素材/活动日历";
			return `周${ weekList[props.week] }素材`;
		} )
		
		return {
			title,
			timeStr
		}
	}
} )