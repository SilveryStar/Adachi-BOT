const template = `<div class="daily-event" :class="{ hidden: !showEvent }">
	<div v-if="showEvent" class="title">
		<common-title :data="{ title: '活动日历' }"></common-title>
	</div>
	<div class="container">
		<div v-if="showEvent" class="event-container">
			<div class="title-list">
				<div v-for="(d, dKey) of dateList" :key="dKey" class="title-item" :class="{ today: dKey === 2 }">
					<p>{{ d.format('dddd M.DD') }}</p>
				</div>
			</div>
			<div class="event-list">
				<template v-if="effectEvents.length">
					<div class="column-list">
						<div v-for="(_, dKey) of dateList" :key="dKey" class="column-item" :class="{ today: dKey === 2 }"></div>
					</div>
					<div v-for="(e, eKey) of effectEvents" :key="eKey" class="event-item">
						<div class="event-item-container" :style="getEventLineStyle(e)">
							<p>{{ e.title }}</p>
							<p>{{ getTimeStr(e.startTime) }}~{{ getTimeStr(e.endTime) }}</p>
							<div v-if="showEndTime(e)" class="end-time">{{ getEndTimeStr(e.endTime) }} 结束</div>
							<img :src="e.banner" alt="ERROR">
						</div>
					</div>
				</template>
				<p v-else class="event-empty">暂无举办中的活动</p>
			</div>
		</div>
		<p v-else class="author">Create by Adachi-BOT</p>
	</div>
</div>`

import CommonTitle from "./common-title.js";

const { defineComponent, computed } = Vue;

export default defineComponent( {
	name: "dailyEvent",
	template,
	components: {
		CommonTitle
	},
	props: {
		showEvent: {
			type: Boolean,
			default: true
		},
		events: {
			type: Array,
			default: () => []
		}
	},
	setup( props ) {
		/* 获取日期列表 */
		const dateList = computed( () => {
			const list = [];
			const first = moment().locale( "zh-cn" ).subtract( 3, "days" );
			for ( let i = 0; i < 8; i++ ) {
				const current = moment( first.add( 1, "days" ) );
				list.push( current );
			}
			return list;
		} )
		
		/* 过滤不在区间范围内的活动 */
		const effectEvents = props.events.filter( e => {
			const list = dateList.value;
			return e.endTime > list[0].valueOf() && e.startTime < list[list.length - 1].valueOf();
		} )
		
		/* 获取格式化时间字符串 */
		const getTimeStr = time => moment( time ).locale( "zh-cn" ).format( "M.DD" );
		
		/* 获取格式化结束小时分钟字符串 */
		const getEndTimeStr = time => moment( time ).locale( "zh-cn" ).add( 1, "minute" ).format( "HH:mm" );
		
		/* 是否显示结束小时分钟 */
		const showEndTime = e => {
			const list = dateList.value;
			return e.endTime < list[list.length - 1].valueOf();
		}
		
		/* 获取活动条的左右定位距离 */
		const dateWidth = 136;
		const getEventLineStyle = ( { startTime, endTime } ) => {
			const startDate = moment( startTime );
			const endDate = moment( endTime );
			const getLeftIndex = curr => {
				const index = dateList.value.findIndex( d => {
					return d.month() === curr.month() && d.date() === curr.date();
				} );
				return index === -1
					? curr.valueOf() < dateList.value[0].valueOf()
						? 0
						: dateList.value.length - 1
					: index
			}
			return {
				left: `${ getLeftIndex( startDate ) * dateWidth }px`,
				right: `${ ( dateList.value.length - getLeftIndex( endDate ) - 1 ) * dateWidth }px`
			}
		}
		
		return {
			dateList,
			effectEvents,
			getTimeStr,
			getEndTimeStr,
			showEndTime,
			getEventLineStyle
		}
	}
} )