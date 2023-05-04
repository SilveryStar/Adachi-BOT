<template>
	<div class="section-title" :class="{hasSub: showSubTitle}">
		<span class="main-title">
			<slot>标题</slot>
		</span>
		<span v-if="showSubTitle" class="sub-title">
			<slot name="sub">副标题</slot>
		</span>
	</div>
</template>

<script lang="ts" setup>
defineProps<{
	showSubTitle: boolean;
}>();
</script>

<style lang="scss" scoped>
.section-title {
	width: 100%;
	position: relative;
	margin: 28px 0;
	display: flex;
	font-size: 32px;
	color: #fff;

	.hasSub {
		margin: 36px 0 42px;

		.main-title {
			top: -8px;
		}

		.sub-title {
			bottom: 10px;
		}
	}

	&::before,
	&::after {
		content: "";
		flex: 1;
		margin: 10px 0;
		background: url("https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/abyss/abyss_title_line.png") no-repeat;
		transform: rotateY(180deg);
		overflow: hidden;
	}

	&::before {
		background-position: left;
	}

	&::after {
		background-position: right;
	}

	.main-title {
		position: relative;
		margin: 0 20px;
	}

	.sub-title {
		position: absolute;
		left: 50%;
		bottom: 0;
		transform: translate(-50%, 100%);
		font-size: 14px;
	}
}
</style>