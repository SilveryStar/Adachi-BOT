<template>
	<div class="info-card">
		<h3 v-if="title">
			<span>{{ title }}</span>
		</h3>
		<div class="info-card-content" v-bind="$attrs">
			<slot></slot>
		</div>
	</div>
</template>

<script lang="ts" setup>
defineProps<{
	title: string;
}>();
</script>

<style lang="scss" scoped>
.info-card {
	width: 492px;
	min-height: 135px;
	margin: 0 auto;
	position: relative;
	display: flex;
	flex-direction: column;

	&::before {
		content: '';
		width: inherit;
		height: 100%;
		position: absolute;
		top: 0;
		right: 0;
		background-color: #fff;
		border-radius: 10px;
		border: 1px solid #dec8a9;
		box-sizing: border-box;
		opacity: 0.85;
		filter: hue-rotate(var(--hue-rotate));
	}

	> h3 {
		position: relative;
		height: 50px;
		margin-top: 1px;
		margin-left: -1px;
		padding: 0 20px;
		display: flex;
		align-items: center;
		font-size: 18px;
		font-weight: 300;
		z-index: 100;

		&::before {
			content: "";
			position: absolute;
			top: 1px;
			right: 2px;
			bottom: 0;
			left: 2px;
			border-radius: 10px 10px 0 0;
			background-image: linear-gradient(to right, #faf3e8, transparent 80%);
			filter: hue-rotate(var(--hue-rotate));
		}

		> span {
			position: relative;
		}
	}

	.info-card-content {
		flex: 1;
		position: relative;
		z-index: 100;
	}
}
</style>