<script lang="ts" setup>
import { infoDataParser } from "#/genshin/front-utils/data-parser";
import { computed } from "vue";
import { InfoResponse, isCharacterInfo } from "#/genshin/types";

const props = defineProps<{
	data: InfoResponse;
}>();

const parsed = computed( () => infoDataParser( props.data ) );

/* 元素 icon */
const elementIcon = computed( () => {
	return isCharacterInfo( props.data ) ? `/assets/genshin/resource/element/${ props.data.element.id.toLowerCase() }.png` : "";
} )
</script>

<template>
	<div class="info-base">
		<header class="info-title">
			<div v-if="elementIcon" class="element-box">
				<img :src="elementIcon" alt="ERROR">
			</div>
			<p class="title-and-name">
				「<span v-if="isCharacterInfo(data)">{{ data.fetter.title }}·</span>{{ data.name }}」
			</p>
			<img :src="parsed.rarityIcon" alt="ERROR" class="rarity-icon">
		</header>
		<main>
			<div class="avatar-box" :class="{ weapon: data.type !== '角色' }">
				<img :src="parsed.mainImage" alt="ERROR"/>
				<p class="introduce">{{ data.fetter.introduce || '暂无介绍' }}</p>
			</div>
			<div class="main-content">
				<slot></slot>
			</div>
		</main>
		<footer class="author">Created by Adachi-BOT</footer>
	</div>
</template>

<style lang="scss" scoped>
.info-base {
	position: relative;
	padding: 40px;

	&::before {
		content: "";
		position: absolute;
		left: 0;
		top: 0;
		right: 0;
		bottom: 0;
		border: 40px solid;
		border-image: url("/assets/genshin/resource/common/base-border.png") 55 fill;
		background-image: url("/assets/genshin/resource/common/base-bg.png");
		filter: hue-rotate(var(--hue-rotate));
	}

	.info-title {
		position: relative;
		margin-left: 4px;
		margin-top: -4px;

		.element-box {
			display: inline-block;
			margin-right: 16px;
			padding: 3px;
			width: 53px;
			height: 53px;
			background: #fff;
			box-shadow: 0 0 6px 0 rgba(198, 156, 80, 0.4);
			border-radius: 50%;
			opacity: 0.8;
			box-sizing: border-box;
			vertical-align: middle;

			img {
				width: 47px;
				height: 47px;
			}
		}

		.title-and-name {
			display: inline-block;
			font-size: 35px;
			color: var(--light-color);
			vertical-align: middle;
		}

		.rarity-icon {
			margin-top: 2px;
			margin-left: 28px;
			height: 34px;
		}
	}

	.author {
		position: absolute;
		top: 42px;
		right: 62px;
		font-size: 22px;
		color: #666666;
	}

	/* 头像部分 */
	main {
		.avatar-box {
			position: absolute;
			top: 86px;
			left: 50%;
			padding: 45px;
			width: 503px;
			height: 498px;
			box-sizing: border-box;
			transform: translateX(-50%);

			&.weapon {
				top: 50%;
				transform: translate(-50%, -50%);
			}

			&::before {
				content: '';
				position: absolute;
				left: 0;
				top: 0;
				right: 0;
				bottom: 0;
				background: url('/assets/genshin/resource/common/stand-bg.png') center no-repeat;
				background-size: contain;
				filter: hue-rotate(var(--hue-rotate));
			}

			img {
				position: relative;
				width: 413px;
				height: 413px;
				border-radius: 50%;
				object-fit: cover;
			}

			.introduce {
				position: absolute;
				left: 50%;
				bottom: 9px;
				padding: 8px 12px;
				width: 369px;
				min-height: 35px;
				background: #fff;
				box-shadow: 0 0 6px 0 var(--shadow-color);
				border-radius: 6px;
				font-size: 16px;
				color: #666;
				line-height: 19px;
				box-sizing: border-box;
				transform: translateX(-50%);
			}
		}

		.main-content {
			padding: 34px 26px 4px;
		}
	}
}
</style>
