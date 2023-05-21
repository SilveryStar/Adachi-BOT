<script lang="ts" setup>
const nums = [
	"", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十",
	"十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十",
	"二十一", "二十二", "二十三", "二十四", "二十五", "二十六", "二十七", "二十八", "二十九", "三十",
	"三十一"
];

const d = new Date();
const year = d.getFullYear();
const month = nums[d.getMonth() + 1] + ( d.getMonth() < 10 ? "月" : "" );
const day = nums[d.getDate()] + ( d.getDate() <= 10 ? "日" : "" );
</script>

<template>
	<div class="almanac-header">
		<img class="title" src="/assets/genshin/resource/almanac/title.svg" alt="ERROR"/>
		<div class="time">
			<p class="year">{{ year }}</p>
			<p class="day">{{ day }}</p>
			<p class="month">{{ month }}</p>
			<div class="just-a-box"/>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.title {
	position: relative;
	width: 220px;
	height: 90px;
	margin: 0 auto;
}

.time {
	position: relative;
	width: 324px;
	height: 50px;
	box-sizing: border-box;
	border: 1.5px solid rgb(129, 118, 96);
	margin: 6px auto 0 auto;
}

.year, .month, .day {
	height: 100%;
	display: inline-flex;
	font-weight: 800;
	font-size: 30px;
	justify-content: center;
	align-items: center;
	vertical-align: top;
}

.year, .month {
	width: 90px;
	color: rgb(141, 118, 80);
}

.day {
	width: calc(100% - 180px);
	color: rgb(247, 248, 242);
	background-color: rgb(141, 118, 80);
}

.just-a-box {
	position: absolute;
	box-sizing: border-box;
	width: 344px;
	height: 40px;
	border: 1px solid rgb(161, 159, 147);
	top: 3.5px;
	left: -11px;
}
</style>