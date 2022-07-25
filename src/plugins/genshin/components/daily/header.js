const template = `<header class="header">
	<div class="container">
		<span v-if="isToday" class="time">{{ timeStr }}</span>
		<div class="title">
			<p>{{ title }}</p>
			<p v-if="subState">（用户 {{ user }} 的订阅数据）</p>
		</div>
		<span v-if="showEvent" class="author">Created by Adachi-BOT</span>
	</div>
</header>
`

const { defineComponent, computed } = Vue;

export default defineComponent( {
	name: "DailyHeader",
	template,
	props: {
		user: {
			type: String,
			default: ""
		},
		week: {
			type: String,
			default: "today"
		},
		showEvent: {
			type: Boolean,
			default: true
		},
		subState: {
			type: Boolean,
			default: true
		}
	},
	setup( props ) {
		const timeStr = computed( () => moment().locale( "zh-cn" ).format( "MM/DD HH:mm dddd" ) );
		const weekList = [ "日", "一", "二", "三", "四", "五", "六" ];
		
		/* 是否为今天 */
		const isToday = computed( () => props.week === "today" );
		
		const title = computed( () => {
			return isToday.value ? "今日素材/活动日历" : `周${ weekList[props.week] }素材`;
		} )
		
		return {
			title,
			timeStr,
			isToday
		}
	}
} )