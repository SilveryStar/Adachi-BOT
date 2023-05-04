<template>
	<div class="info-line">
		<h3 class="line-title">{{ title }}</h3>
		<ul class="line-content">
			<li v-for="(d, dKey) of data" :key="dKey">
				<div v-for="label of Object.keys(d)" :key="label" class="item-data">
					<span>{{ label }}</span>
					<span>{{ d[label] || '未知' }}</span>
				</div>
			</li>
		</ul>
	</div>
</template>

<script lang="ts" setup>
withDefaults( defineProps<{
	title: string;
	width: string;
	data: any[];
}>(), {
	title: "卡片标题",
	width: "362px",
	data: () => []
} );
</script>

<style lang="scss" scoped>
.info-line {
	position: relative;
	display: flex;
	flex-direction: column;
	width: 362px;

	.line-title {
		height: 39px;
		border-radius: 3px;
		background-color: var(--base-color);
		font-size: 20px;
		line-height: 39px;
		font-weight: 500;
		text-align: center;
		color: #fff;
	}

	.line-content {
		margin: 18px 0 0;
		padding: 0;
		list-style: none;

		li {
			display: flex;
			align-items: center;
			margin-bottom: 18px;
			padding: 6px 16px;
			min-height: 40px;
			background-color: #fff;
			box-shadow: 0 0 6px 0 var(--shadow-color);
			border-radius: 6px;
			box-sizing: border-box;

			&:last-child {
				margin-bottom: 0;
			}

			.item-data {
				display: flex;
				align-items: center;
				flex: 1;

				span {
					font-size: 16px;
					color: #666;

					&:first-child {
						flex: 0 0 auto;
						margin-right: 14px;
					}
				}
			}
		}
	}
}
</style>