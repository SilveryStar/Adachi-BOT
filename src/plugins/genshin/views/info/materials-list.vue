<template>
	<div class="materials-list">
		<div v-if="data.label" class="list-label">{{ data.label }}</div>
		<div class="list-data">
			<materials-item v-for="(m, mKey) of data.value" :key="mKey" :name="m"
			                :showTitle="data.showTitle"></materials-item>
		</div>
	</div>
</template>

<script lang="ts" setup>
import MaterialsItem from "./materials-item.vue"

withDefaults( defineProps<{
	data: Record<string, any>;
}>(), {
	data: () => ({})
} );

function icon( name ) {
	return `https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/info/image/${ name }.png`;
}
</script>

<style lang="scss" scoped>
.materials-list {
	position: relative;
	padding: 0 20px 0 40px;

	.list-label {
		position: absolute;
		left: 0;
		top: 16px;
		display: flex;
		align-items: center;
		padding: 0 2px;
		width: 21px;
		height: 64px;
		background-color: var(--base-color);
		border-radius: 0 9px 9px 0;
		font-size: 16px;
		color: #fff;
		box-sizing: border-box;
	}

	.list-data {
		position: relative;
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		grid-row-gap: 16px;
		justify-content: space-between;
		justify-items: center;
		flex-wrap: wrap;
		padding: 16px 0;

		&:after {
			content: '';
			position: absolute;
			left: 0;
			bottom: 0;
			width: 100%;
			height: 1px;
			background-color: var(--base-color);
			opacity: 0.2;
		}
	}
}
</style>