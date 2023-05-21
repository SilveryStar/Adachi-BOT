<script lang="ts" setup>
withDefaults( defineProps<{
	title?: string;
	direction: "row" | "col";
}>(), {
	direction: "col"
} );
</script>

<template>
	<div class="info-card" :class="direction">
		<h3 v-if="title" class="card-title">{{ title }}</h3>
		<div class="card-content" :class="{ 'no-header': !title }">
			<slot></slot>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.info-card {
	--card-title-height: 47px;
	width: 362px;
	position: relative;

	&.row {
		width: auto;

		.card-title {
			padding: 0 14px;
			width: var(--card-title-height);
			height: 100%;
			border-radius: 6px 0 0 6px;
		}

		.card-content {
			height: 100%;
			padding-top: 0;
			padding-left: var(--card-title-height);
		}
	}

	.card-title {
		position: absolute;
		left: 0;
		top: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		height: var(--card-title-height);
		border-radius: 6px 6px 0 0;
		background-color: var(--base-color);
		font-size: 20px;
		font-weight: 500;
		color: #fff;
		box-sizing: border-box;
	}

	.card-content {
		padding-top: var(--card-title-height);
		min-height: 200px;
		background-color: #fff;
		box-shadow: 0 0 6px 0 var(--shadow-color);
		border-radius: 6px;
		box-sizing: border-box;

		&.no-header {
			padding: 0;
		}
	}
}
</style>