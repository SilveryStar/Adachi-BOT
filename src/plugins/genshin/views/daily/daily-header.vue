<script lang="ts" setup>
import { computed } from "vue";
import moment from "moment";

const props = withDefaults( defineProps<{
	user: string;
	week?: string;
	showEvent?: boolean;
	subState?: boolean;
}>(), {
	week: "today",
	showEvent: true,
	subState: true
} );

const timeStr = computed( () => moment().format( "MM/DD HH:mm dddd" ) );
const weekList = [ "日", "一", "二", "三", "四", "五", "六" ];

/* 是否为今天 */
const isToday = computed( () => props.week === "today" );

const title = computed( () => {
	return isToday.value ? "今日素材/活动日历" : `周${ weekList[props.week] }素材`;
} )
</script>

<template>
	<header class="header">
		<div class="container">
			<span v-if="isToday" class="time">{{ timeStr }}</span>
			<div class="title">
				<p>{{ title }}</p>
				<p v-if="subState">（用户 {{ user }} 的订阅数据）</p>
			</div>
			<span v-if="showEvent" class="author">Created by Adachi-BOT</span>
		</div>
	</header>
</template>

<style lang="scss" scoped>
.header {
	position: relative;
	display: flex;
	padding: 12px 12px 0;
	height: 69px;
	background-color: var(--primary-dark);
	box-shadow: 0 10px 20px var(--shadow-base);
	color: #fff;
	z-index: 10;

	.container {
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
		flex: 1;
		border: 4px solid var(--primary-base);
		border-bottom: none;
		border-radius: 8px 8px 0 0;
		text-align: center;
	}

	.time {
		position: absolute;
		left: 28px;
		font-size: 20px;
	}

	.title {
		display: inline-block;
		text-align: center;
		line-height: 1.15;

		> p {
			&:nth-of-type(1) {
				font-size: 28px;
			}

			&:nth-of-type(2) {
				margin-top: 4px;
				font-size: 12px;
			}
		}
	}

	.author {
		position: absolute;
		right: 28px;
		font-size: 18px;
	}
}
</style>