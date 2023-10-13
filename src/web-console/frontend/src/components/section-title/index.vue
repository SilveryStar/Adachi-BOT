<template>
	<div class="section-title">
		<h3>{{ title }}</h3>
		<span v-if="desc" class="desc">{{ desc }}</span>
		<div class="append">
			<slot/>
		</div>
	</div>
</template>

<script lang="ts" setup>
interface IProps {
	title?: string;
	desc?: string;
}

const props = withDefaults(defineProps<IProps>(), {
	title: "",
	desc: ""
});

</script>

<style lang="scss" scoped>
.section-title {
	display: flex;
	align-items: center;
	margin: 4px 0;
	height: 32px;
	border-bottom: 1px dotted #e6e6e6;

	&:before {
		content: "";
		position: relative;
		top: 1px;
		margin-right: 0.6em;
		width: 4px;
		height: 16px;
		background-color: var(--el-color-primary);
		border-radius: 2px;
	}

	> h3 {
		font-size: 16px;
		font-weight: normal;
		line-height: 1.2em;
	}

	.desc {
		margin-left: 20px;
		font-size: 12px;
		color: #999;
		line-height: 1.2em;
	}

	.append {
		margin-left: 30px;
	}
}
</style>