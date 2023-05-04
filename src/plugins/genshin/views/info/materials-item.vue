<template>
	<div class="materials-item">
		<img class="material-icon" :src="icon" alt="ERROR"/>
		<p v-if="title" class="materials-title">{{ title }}</p>
	</div>
</template>


<script lang="ts" setup>
import { computed } from "vue";

const props = withDefaults( defineProps<{
	name: string;
	showTitle: boolean;
}>(), {
	name: "",
	showTitle: false
} );

const icon = computed( () => {
	return `https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/info/image/${ props.name }.png`;
} )

const title = computed( () => {
	if ( !props.showTitle ) return "";
	const result = props.name.match( /「(.+)」.+/ );
	return result ? result[1] : "";
} )
</script>

<style lang="scss" scoped>
.materials-item {
	position: relative;
	width: 64px;
	height: 64px;
	border-radius: 8px;

	&:after {
		content: "";
		position: absolute;
		left: 2px;
		bottom: 2px;
		right: 2px;
		top: 2px;
		border: 1px solid var(--light-color);
		border-radius: 8px;
	}

	.material-icon {
		width: 100%;
		height: 100%;
		border-radius: 8px;
		border: 1px solid var(--light-color);
		box-sizing: border-box;
	}

	.materials-title {
		position: absolute;
		left: 0;
		bottom: 6px;
		width: 100%;
		height: 16px;
		background-color: rgba(0, 0, 0, .6);
		font-size: 12px;
		line-height: 19px;
		color: #fff;
		text-align: center;
	}
}
</style>