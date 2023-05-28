<script lang="ts" setup>
import moment, { Moment } from "moment";
import { computed } from "vue";
import CommonTitle from "./common-title.vue";
import { DailyEvent } from "#/genshin/types/daily";

const props = withDefaults( defineProps<{
	showEvent?: boolean;
	showMaterial?: boolean;
	events: DailyEvent[];
}>(), {
	showEvent: true,
	showMaterial: true
} );

const version = window.ADACHI_VERSION;

/* 获取日期列表 */
const dateList = computed( () => {
	const first = moment().subtract( 3, "days" );
	return Array.from( { length: 8 }, () => {
		return moment( first.add( 1, "days" ) );
	} );
} )

/* 过滤不在区间范围内的活动 */
const effectEvents = props.events.filter( ( e: any ) => {
	const list = dateList.value;
	return e.endTime > list[0].valueOf() && e.startTime < list[list.length - 1].valueOf();
} )

/* 获取格式化时间字符串 */
const getTimeStr = time => moment( time ).format( "M.DD" );

/* 获取格式化结束小时分钟字符串 */
const getEndTimeStr = time => moment( time ).add( 1, "minute" ).format( "HH:mm" );

/* 是否显示结束小时分钟 */
const showEndTime = ( event: DailyEvent ) => {
	const list = dateList.value;
	return event.endTime < list[list.length - 1].valueOf();
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
</script>

<template>
	<div class="daily-event" :class="{ hidden: !showEvent }">
		<div v-if="showEvent && showMaterial" class="title">
			<common-title :data="{ title: '活动日历' }"/>
		</div>
		<div class="container">
			<div v-if="showEvent" class="event-container">
				<div class="title-list">
					<div v-for="(d, dKey) of dateList" :key="dKey" class="title-item" :class="{ today: dKey === 2 }">
						<p>{{ d.format( 'dddd M.DD' ) }}</p>
					</div>
				</div>
				<div class="event-list">
					<template v-if="effectEvents.length">
						<div class="column-list">
							<div v-for="(_, dKey) of dateList" :key="dKey" class="column-item"
							     :class="{ today: dKey === 2 }"></div>
						</div>
						<div v-for="(e, eKey) of effectEvents" :key="eKey" class="event-item">
							<div class="event-item-container" :style="getEventLineStyle(e)">
								<p>{{ e.title }}</p>
								<p>{{ getTimeStr( e.startTime ) }}~{{ getTimeStr( e.endTime ) }}</p>
								<div v-if="showEndTime(e)" class="end-time">{{ getEndTimeStr( e.endTime ) }} 结束</div>
								<img :src="e.banner" alt="ERROR">
							</div>
						</div>
					</template>
					<p v-else class="event-empty">暂无举办中的活动</p>
				</div>
			</div>
			<p v-else class="author">Create by Adachi-BOT v{{ version }}</p>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.daily-event {
	position: relative;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 0 12px 12px;
	background-color: #EEE5DD;
	/* 隐藏样式 */
	&.hidden {
		background-color: var(--primary-dark);

		.container {
			padding: 8px 0;
			border-color: var(--primary-base);
		}

		.author {
			text-align: center;
			color: #fff;
			font-size: 18px;
		}
	}

	.title {
		position: absolute;
		top: -1px;
		left: 50%;
		display: flex;
		justify-content: center;
		align-items: center;
		width: 1100px;
		height: 2px;
		background-color: #fff;
		box-shadow: 0 2px 2px var(--shadow-base);
		transform: translateX(-50%);
	}

	.container {
		display: flex;
		justify-content: center;
		flex: 1;
		padding: 46px 0 28px;
		width: 100%;
		border-width: 0 4px 4px 4px;
		border-style: solid;
		border-color: var(--primary-dark);
		border-radius: 0 0 8px 8px;
		box-sizing: border-box;
	}

	.event-container {
		width: 1088px;
		background-color: var(--primary-base);
		border: 2px solid var(--primary-dark);
		box-shadow: 0 0 0 5px var(--primary-base), 0 0 0 9px var(--primary-dark), 1px 4px 6px 9px var(--shadow-base);
		border-radius: 8px;
		overflow: hidden;

		.title-list {
			display: flex;
			filter: drop-shadow(0 8px 10px rgba(136, 100, 68, 0.2));
			overflow: hidden;
		}

		.title-item {
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			flex: 1;
			padding: 10px;
			height: 58px;
			background-color: var(--primary-dark);
			box-sizing: border-box;

			&.today {
				background-color: #B08C69;
			}

			> p {
				width: 50px;
				font-size: 16px;
				line-height: 19px;
				text-align: center;
				color: #fff;
			}
		}

		.event-list {
			position: relative;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			padding: 12px 2px;
			gap: 14px;
			min-height: 200px;
		}

		.event-empty {
			display: flex;
			justify-content: center;
			align-items: center;
			flex: 1;
			width: 100%;
			font-size: 32px;
			color: #E0CCB8;
		}

		/* 背景列 */
		.column-list {
			position: absolute;
			top: 0;
			right: 0;
			left: 0;
			bottom: 0;
			display: flex;
		}

		.column-item {
			flex: 1;
			border-right: 1px solid var(--primary-dark);

			&:last-child {
				border-right: none;
			}
		}

		.event-item {
			position: relative;
			width: 100%;
			height: 72px;
			z-index: 5;
		}

		.event-item-container {
			position: absolute;
			top: 0;
			bottom: 0;
			display: flex;
			flex-direction: column;
			justify-content: center;
			padding: 0 10px;
			background-color: #B28A66;
			border: 2px solid #fff;
			box-shadow: 0 0 0 2px #B28A66, 1px 4px 6px 2px var(--shadow-base);
			border-radius: 4px;
			overflow: hidden;
			font-size: 16px;
			line-height: 19px;
			color: #fff;

			> p {
				position: relative;
				overflow: hidden;
				white-space: nowrap;
				text-overflow: clip;
				z-index: 10;

				&:first-child {
					margin-bottom: 10px;
				}
			}

			.end-time {
				position: absolute;
				right: 0;
				bottom: 0;
				z-index: 10;
				font-size: 12px;
				padding: 2px 4px;
				background-color: rgba(0, 0, 0, .5);
				border-radius: 4px 0 0 0;
				opacity: 0.9;
			}

			> img {
				position: absolute;
				height: 100%;
				right: 0;
				top: 0;
				filter: brightness(.75);
			}
		}
	}
}

.today {
	background-color: rgb(178 138 102 / 31%);
}
</style>