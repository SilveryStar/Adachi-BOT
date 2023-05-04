<template>
	<ul class="reveal">
		<li v-for="(d , dKey) of data" :key="dKey">
			<img :src="getSideIcon(d.avatarId)" alt="ERROR">
			<span>{{ d.value }} 次</span>
		</li>
	</ul>
</template>

<script lang="ts" setup>
const props = withDefaults( defineProps<{
	data: any[];
}>(), {
	data: () => []
} );

const getSideIcon = code => `https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/sides/${ code }.png`;
</script>

<style lang="scss" scoped>
.reveal {
	margin: 0;
	padding: 0;
	width: 378px;
	display: flex;
	border-radius: 16px;
	background-color: rgba(97, 102, 184, .3);
	box-shadow: 0px 3px 8px 1px rgba(0, 0, 0, .3);
	flex-wrap: wrap;
	align-items: center;

	li {
		padding: 0 32px;
		width: 50%;
		height: 70px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		box-sizing: border-box;

		&:nth-of-type(4n + 1),
		&:nth-of-type(4n + 2) {
			background-color: rgba(0, 0, 0, .2);
		}

		img {
			margin-bottom: 8px;
			height: 52px;
		}

		span {
			font-size: 24px;
		}
	}
}
</style>