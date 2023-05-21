<script lang="ts" setup>
import { computed } from "vue";

const props = withDefaults( defineProps<{
	data: Record<string, any>;
}>(), {
	data: () => ( {} )
} );

const time = computed( () => {
	return props.data.status === "Ongoing"
		? `预计将在 ${ props.data.remainedTime } 完成探索`
		: "探险完成";
} );
</script>

<template>
	<div class="expedition" :class="{ finish: data.status === 'Finished' }">
		<div class="profile">
			<div class="circle1"/>
			<div class="circle2"/>
			<img class="icon" :src="data.avatarSideIcon" alt="ERROR"/>
		</div>
		<p class="time">{{ time }}</p>
	</div>
</template>

<style lang="scss" scoped>
.expedition {
	height: 46px;
	width: 100%;
	background: linear-gradient(to right, rgb(236, 227, 217), transparent);
	margin-top: 9px;
	border-radius: 23px;
}

.profile {
	position: relative;
	display: inline-table;
	vertical-align: middle;
	width: 36px;
	height: 36px;
	margin: 5px 16px;
	border-radius: 50%;
	background-color: #ffffff;
}

.circle1 {
	position: absolute;
	width: 32px;
	height: 32px;
	margin: 2px;
	z-index: 1;
	border-radius: 50%;
	background-color: rgb(221, 155, 77);
}

.circle2 {
	position: absolute;
	width: 28px;
	height: 28px;
	margin: 4px;
	z-index: 2;
	border-radius: 50%;
	background-color: #ffffff;
}

.finish {
	.circle1 {
		background-color: rgb(146, 185, 46);
	}

	.time {
		color: rgb(146, 185, 46);
	}
}

.time {
	position: relative;
	display: inline-table;
	vertical-align: middle;
	line-height: 46px;
	font-size: 14px;
	color: rgb(132, 125, 121);
}

.icon {
	position: absolute;
	z-index: 3;
	width: 48px;
	top: -16px;
	left: -6px;
}
</style>