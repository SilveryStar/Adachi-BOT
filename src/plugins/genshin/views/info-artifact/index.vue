<template>
	<div id="app" class="info-artifact">
		<template v-if="data">
			<header>
				<p class="title-and-name">
					「<span v-show="data.title">{{ data.title }}·</span>{{ data.name }}」
				</p>
				<img :src="data.rarityIcon" alt="ERROR" class="rarity-icon">
			</header>
			<main>
				<div class="avatar-box">
					<img :src="data.mainImage" alt="ERROR"/>
				</div>
				<div class="main-content">
					<div class="shirt-title">{{ data.name }}</div>
					<template v-for="(e, eKey) in data.effects">
						<p class="effect-title">{{ eKey }}件套</p>
						<div class="effect-content" v-html="e"></div>
					</template>
				</div>
				<div class="main-content">
					<p class="access">获取途径: {{ data.access }}</p>
				</div>
			</main>
			<footer class="author">Created by Chaichai-BOT</footer>
		</template>
	</div>
</template>

<script lang="ts" setup>
import { infoDataParser } from "#/genshin/front-utils/data-parser";
import $https from "#/genshin/front-utils/api";
import { onMounted, ref } from "vue";
import { urlParamsGet } from "@/utils/common";

const urlParams = urlParamsGet( location.href );

const data = ref<Record<string, any> | null>( null );

const getData = async () => {
	const res = await $https.INFO.get( { name: urlParams.name } );
	const parser = infoDataParser( res );
	parser.initBaseColor( res );
	data.value = {
		...res,
		...parser
	}
};

onMounted( () => {
	getData();
} )

</script>

<style src="../../public/styles/reset.css"></style>

<style lang="scss" scoped>
#app {
	width: 460px;
}

.info-artifact {
	position: relative;
	padding: 40px;
	box-sizing: border-box;

	&::before {
		content: "";
		position: absolute;
		left: 0;
		top: 0;
		right: 0;
		bottom: 0;
		border: 40px solid;
		border-image: url("https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/common/base-border.png") 55 fill;
		background-image: url('https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/common/base-bg.png');
		filter: hue-rotate(var(--hue-rotate));
	}

	header, main, footer {
		position: relative;
		margin: 0 -10px;
	}

	header {
		position: relative;

		.title-and-name {
			margin-left: -5px;
			font-size: 24px;
			color: var(--light-color);
		}

		.rarity-icon {
			margin-left: -3px;
			height: 25px;
		}
	}

	main {
		/* 头像部分 */
		.avatar-box {
			position: relative;
			display: flex;
			justify-content: center;
			align-items: center;
			margin-top: -5px;
			margin-left: -12px;
			margin-bottom: -16px;
			width: 420px;
			height: 416px;
			box-sizing: border-box;

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
				width: 256px;
			}
		}

		.main-content {
			position: relative;
			padding: 6px 0;
			border-bottom: 1px solid var(--shadow-color);

			.shirt-title {
				margin-bottom: 10px;
				font-size: 22px;
				line-height: 24px;
				color: var(--light-color);
			}

			.effect-title {
				font-size: 16px;
				line-height: 20px;
				color: var(--light-color);
			}

			.effect-content {
				margin-bottom: 6px;
				font-size: 14px;
				line-height: 24px;
				color: #666;
			}

			/* 来源 */
			.access {
				font-size: 14px;
				line-height: 24px;
				color: #666;
			}
		}
	}

	footer {
		/* 作者信息 */
		&.author {
			margin-bottom: -23px;
			font-size: 14px;
			line-height: 32px;
			color: #666;
			text-align: center;
		}
	}
}
</style>