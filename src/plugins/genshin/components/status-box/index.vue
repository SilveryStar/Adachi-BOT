<template>
	<div class="status-base">
		<img :src="data.icon" alt="ERROR"/>
		<div class="status-base-detail">
			<span>{{ data.label }}</span>
			<span>{{ data.value }}</span>
		</div>
	</div>
</template>

<script lang="ts" setup>
withDefaults( defineProps<{
	data: {
		icon: string;
		label: string;
		value: string;
	};
}>(), {
	data: () => ( {
		icon: "",
		label: "",
		value: ""
	} )
} );
</script>

<style lang="scss" scoped>
.status-base {
	display: flex;
	align-items: center;
	width: 28.8em;
	height: 7.5em;
	background: url("https://adachi-bot.oss-cn-beijing.aliyuncs.com/images/card/data_item_bg.png") no-repeat;
	background-size: contain;
	font-size: 10px;

	img {
		margin-left: 3em;
		width: 4.4em;
	}

	.status-base-detail {
		flex: 1;
		margin-left: 3.2em;
		margin-right: 1.8em;
		text-align: center;

		span {
			vertical-align: top;

			&:nth-of-type(1) {
				font-size: 2.2em;
			}

			&:nth-of-type(2) {
				margin-left: 0.278em;
				font-size: 1.8em;
			}
		}
	}
}
</style>