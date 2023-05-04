<template>
	<div class="home-box">
		<img class="home-background" :src="backgroundImage" alt="ERROR"/>
		<template v-if="data.level !== -1">
			<div class="box-block unlock-block"/>
			<div class="box-block unlock-content-block">
				<p class="box-content name">{{ data.name }}</p>
				<p class="box-content level">洞天等级</p>
				<p class="box-content comfort">{{ data.comfortLevelName }}</p>
			</div>
		</template>
		<template v-else>
			<div class="box-block locked-block"/>
			<img class="lock-icon" :src="lockIcon" alt="ERROR"/>
		</template>
	</div>
</template>

<script lang="ts" setup>
import { defineComponent, computed } from "vue";

const props = withDefaults( defineProps<{
	data: Record<string, any>;
}>(), {
	data: () => ( {} )
} );

const backgroundImage = computed( () => {
	return `https://adachi-bot.oss-cn-beijing.aliyuncs.com/item/${ props.data.name }.png`;
} );
const lockIcon = computed( () => {
	return "https://adachi-bot.oss-cn-beijing.aliyuncs.com/item/lock.png";
} );
</script>

<style lang="scss" scoped>
.home-box {
	--home-width: 18.4em;
	position: relative;
	display: flex;
	min-width: var(--home-width);
	height: var(--home-width);
	margin-bottom: 1.5em;
	border-radius: 1.8em;
	font-size: 10px;

	.home-background {
		flex: 1;
		object-fit: cover;
		border-radius: inherit;
	}

	.box-block {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		border-radius: inherit;
	}

	.locked-block {
		background-color: rgba(0, 0, 0, 0.6);
	}

	.lock-icon {
		position: absolute;
		height: 8em;
		width: 6.6em;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
	}

	.unlock-block {
		background-color: rgba(0, 0, 0, 0.22);
	}

	.unlock-content-block {
		display: flex;
		flex-direction: column;
		justify-content: center;
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		background-color: rgba(0, 0, 0, 0.3);
		height: 12.2em;
		border-radius: inherit;
	}

	.box-content {
		position: relative;
		text-align: center;
	}

	.name {
		position: relative;
		margin-bottom: 0.48em;
		color: rgb(242, 210, 134);
		font-size: 2.5em;
	}

	.level {
		font-size: 2.2em;
		color: rgb(227, 221, 194);
	}

	.comfort {
		font-size: 2em;
		color: rgb(255, 255, 255);
		margin-top: 0.1em;
		-webkit-text-stroke: 0.03em rgb(92, 82, 4);
	}
}
</style>