<template>
	<div class="info box">
		<img :src="data.icon" alt="ERROR"/>
		<div class="text">
			<p class="info-title">{{ data.title }}</p>
			<p class="info-subtitle">{{ data.subtitle }}</p>
		</div>
		<p class="data" :class="{ mini: data.miniFontSize }">{{ data.value }}</p>
	</div>
</template>

<script lang="ts" setup>
defineProps<{
	data: Record<string, any>;
}>()
</script>

<style lang="scss" scoped>
.info {
	position: relative;
	display: flex;
	justify-content: space-between;
	height: 60px;
	margin-bottom: 12px;

	> img {
		position: absolute;
		height: 22px;
		left: 10px;
		top: 9px;
	}
}

.text {
	flex: 1;
	position: relative;
	display: inline-block;
	margin: 10px 0 10px 36px;
}

.info-title {
	line-height: 22px;
	color: rgb(90, 90, 90);
	font-size: 16px;
}

.info-subtitle {
	line-height: 18px;
	color: rgb(192, 184, 173);
	font-size: 14px;
}

.data {
	display: inline-block;
	line-height: 60px;
	text-align: center;
	font-size: 15px;
	width: 25%;
	background-color: rgb(235, 227, 216);
	color: rgb(99, 82, 65);
}

.mini {
	&.data {
		font-size: 13px;
	}
}
</style>
