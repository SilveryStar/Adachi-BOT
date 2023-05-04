<template>
	<div class="info-base">
		<header class="info-title">
			<div v-if="elementIcon" class="element-box">
				<img :src="elementIcon" alt="ERROR">
			</div>
			<p class="title-and-name">
				「<span v-show="data.title">{{ data.title }}·</span>{{ data.name }}」
			</p>
			<img :src="parsed.rarityIcon" alt="ERROR" class="rarity-icon">
		</header>
		<main>
			<div class="avatar-box" :class="{ weapon: data.type !== '角色' }">
				<img :src="parsed.mainImage" alt="ERROR"/>
				<p class="introduce">{{ data.introduce || '暂无介绍' }}</p>
			</div>
			<div class="main-content">
				<slot></slot>
			</div>
		</main>
		<footer class="author">Created by Chaichai-BOT</footer>
	</div>
</template>

<script lang="ts" setup>
import { infoDataParser } from "#/genshin/front-utils/data-parser";
import { computed } from "vue";

const props = withDefaults( defineProps<{
	data: {
		rarity: number | null;
		name: string;
		id: number | null;
		type: string;
		title: string;
		introduce: string;
		element: string;
	}
}>(), {
	data: () => ( {
		rarity: null,
		name: "",
		id: null,
		type: "",
		title: "",
		introduce: "",
		element: ""
	} )
} );

const parsed = computed( () => infoDataParser( props.data ) );

const elementFormat = {
	"风元素": "Anemo",
	"冰元素": "Cryo",
	"草元素": "Dendro",
	"雷元素": "Electro",
	"岩元素": "Geo",
	"水元素": "Hydro",
	"火元素": "Pyro"
};

/* 元素 icon */
const elementIcon = computed( () => {
	return props.data.element ? `https://adachi-bot.oss-cn-beijing.aliyuncs.com/images/element/Element_${ elementFormat[props.data.element] }.png` : "";
} )
</script>

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
		border-image: url("https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/common/base-border.png") 55 fill;
		background-image: url("https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/common/base-bg.png");
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
				background: url('https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/common/stand-bg.png') center no-repeat;
				background-size: contain;
				filter: hue-rotate(var(--hue-rotate));
			}

			img {
				position: relative;
				width: 413px;
				height: 413px;
				border-radius: 50%;
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
