<template>
	<div class="common-title">
		<img v-if="data.icon" :src="data.icon" alt="ERROR" class="icon">
		<div class="title">{{ data.title }}</div>
	</div>
</template>

<script lang="ts" setup>
withDefaults(defineProps<{
	data: {
		icon: string;
		title: string;
	};
}>(), {
	data: () => ({
		icon: "",
		title: ""
	})
});
</script>

<style lang="scss" scoped>
.common-title {
	display: flex;
	align-items: center;
	min-width: 150px;

	.icon {
		flex: 0 0 auto;
		margin-right: -24px;
		width: 42px;
		height: 42px;
		border: 2px solid var(--primary-base);
		filter: drop-shadow(0 2px 2px var(--shadow-dark));
		border-radius: 50%;
	}

	.title {
		flex: 1;
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 0 12px;
		height: 30px;
		background-color: var(--primary-dark);
		border: 2px solid var(--primary-base);
		box-shadow: 0 2px 2px var(--primary-dark);
		border-radius: 17px;
		font-size: 16px;
		color: #fff;
	}
}
</style>