<template>
	<div class="equipment-box" :class="{ empty: !src }">
		<template v-if="src">
			<img class="content image" :src="src" alt="ERROR">
			<span v-if="level || level === 0" class="level">+{{ level }}</span>
			<img v-if="rarity" class="star" :src="starImgSrc" alt="ERROR">
		</template>
		<i v-else :class="emptyIcon" class="content icon"></i>
	</div>
</template>

<script lang="ts" setup>
import { computed, defineComponent } from "vue";

const props = withDefaults( defineProps<{
	src: string;
	rarity: number;
	level: number;
	emptyIcon: string;
}>(), {
	emptyIcon: "icon-lock"
} );

const starImgSrc = computed( () => {
	return `https://adachi-bot.oss-cn-beijing.aliyuncs.com/images/stars/Icon_${ props.rarity }_Stars.png`;
} );
</script>

<style lang="scss" scoped>
.equipment-box {
	width: 6em;
	height: 6em;
	position: relative;
	font-size: 10px;

	&::before {
		content: "";
		width: inherit;
		height: inherit;
		position: absolute;
		left: 0;
		top: 0;
		border-radius: 0.8em;
		border: 0.1em solid var(--baseInfoColor);
		background-color: #333;
		box-shadow: 0 0 0 0.1em #333;
		opacity: 0.67;
		box-sizing: border-box;
	}

	.content {
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		z-index: 100;

		&.image {
			width: 5.2em;
			height: 5.2em;
		}

		&.icon {
			font-size: 36px;
			line-height: 38px;
			color: #fff;
			opacity: 0.6;

			&.icon-lock {
				font-size: 24px;
				line-height: 26px;
			}
		}
	}

	.level {
		position: absolute;
		top: 1px;
		right: 1px;
		transform: scale(0.8);
		font-size: 1.2em;
		color: #fff;
		z-index: 100;
	}

	.star {
		height: 1.4em;
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		z-index: 100;
	}

	/* 空数据时 */
	&.empty {
		&::before {
			opacity: 0.45;
		}
	}
}
</style>