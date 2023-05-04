<template>
	<div v-if="data" id="app" class="card-base">
		<card-header
			:data="data"
			:url-params="urlParams"
			:info-list="data.statsList.base"
		/>
		<main>
			<section class="card-user">
				<article class="card-user-info">
					<h3 class="card-title">数据总览</h3>
					<div class="card-status-box">
						<status-box
							v-for="(status, index) in data.statsList.chest.concat(data.statsList.culus)"
							:key="index"
							:data="status"
						/>
					</div>
				</article>
				<article class="card-exploration">
					<h3 class="card-title">世界探索</h3>
					<div class="card-exploration-box">
						<exploration-box
							v-for="(exploration, index) in data.explorationsList"
							:key="index"
							:class="getSizeClass(data.explorationsList, index)"
							class="card-exploration-item"
							:data="exploration"
						/>
					</div>
				</article>
			</section>
			<section class="card-home">
				<h3 class="card-title">尘歌壶</h3>
				<div class="card-home-box">
					<p class="card-home-info">等级: Lv.{{ data.homesLevel }} 仙力: {{ data.maxComfort }}</p>
					<div class="card-home-list">
						<home-box
							class="card-home-item"
							:class="getSizeClass(data.formatHomes, index)"
							v-for="(home, index) of data.formatHomes"
							:key="index"
							:data="home"
						/>
					</div>
				</div>
			</section>
			<section class="card-character">
				<h1 class="card-character-title">角色背包</h1>
				<div class="character-line">
					<character-box
						class="character-item"
						v-for="(char, charIndex) in data.avatars"
						:key="charIndex"
						:char="char"
						:type="urlParams.style"
					/>
				</div>
				<p class="sign">Created by Chaichai-BOT</p>
			</section>
		</main>
	</div>
</template>

<script lang="ts" setup>
import { onMounted, ref, Ref } from "vue";
import CardHeader from "./card-header.vue";
import HomeBox from "#/genshin/components/home-box/index.vue";
import CharacterBox from "#/genshin/components/character-box/index.vue";
import ExplorationBox from "#/genshin/components/exploration-box/index.vue";
import StatusBox from "#/genshin/components/status-box/index.vue";
import $https from "#/genshin/front-utils/api";
import { cardDataParser, sizeClass } from "#/genshin/front-utils/data-parser";
import { urlParamsGet } from "@/utils/common";

const urlParams = urlParamsGet( location.href );

const data: Ref<Record<string, any> | null> = ref( null );

onMounted( async () => {
	const res = await $https.CARD.get( { qq: urlParams.qq } );
	data.value = {
		...res,
		...cardDataParser( res )
	}
} );

const getSizeClass = sizeClass( 3 );
</script>

<style src="../../public/styles/reset.css"></style>

<style lang="scss" scoped>
#app {
	width: 1454px;
}

/* 通用 */
.card-base {
	--border-color: #cbc0a9;
	--background-color: #fff;
	position: relative;
	background-color: #f8f5f1;
	border-radius: 24px;
}

.card-title {
	display: flex;
	margin: 16px 0;
	font-weight: normal;
	font-size: 32px;
	line-height: 34px;

	::before {
		content: "";
		width: 8px;
		margin-right: 10px;
		background-color: #cbc0a9;
	}
}

.medium {
	min-width: 310px !important;
}

.large {
	min-width: 440px !important;
}

/* 整体布局 */
.card-base {
	position: relative;
	display: flex;
	flex-direction: column;

	main {
		padding: 40px 16px 0;
		border-style: solid;
		border-width: 0 70px 70px 70px;
		border-image: url("https://adachi-bot.oss-cn-beijing.aliyuncs.com/images/card/card-base-bg.png") 70 fill;
	}

	/* 用户信息页 */
	.card-user {
		.card-user-info {
			overflow: hidden;

			.card-status-box {
				display: grid;
				grid-template-columns: repeat(4, 288px);
				grid-row-gap: 15px;
				justify-content: space-between;
				justify-items: center;
				padding: 14px 18px;
				margin-bottom: 15px;
				border: 1px solid var(--border-color);
				border-radius: 4px;
				background-color: var(--background-color);
				list-style: none;
				font-size: 30px;
				line-height: 56px;
			}
		}

		/* 区域探索 */
		.card-exploration {
			margin-top: 24px;

			.card-exploration-box {
				display: flex;
				justify-content: space-between;
				flex-wrap: wrap;
				margin: 0 -10px;

				.card-exploration-item {
					flex: 1;
					margin: 0 10px 20px;
				}
			}
		}
	}

	/* 家园 */
	.card-home {
		margin-bottom: 20px;

		.card-home-box {
			.card-home-info {
				display: inline-block;
				padding: 0 12px;
				border: 1px solid var(--border-color);
				border-radius: 20px;
				margin-bottom: 10px;
				background-color: var(--background-color);
				font-size: 20px;
				line-height: 40px;
			}

			.card-home-list {
				display: flex;
				flex-wrap: wrap;
				margin: 0 -10px;

				.card-home-item {
					flex: 1;
					margin: 0 10px 20px;
					height: 140px;
					border-radius: 6px;

					:deep(.box-block) {
						height: 100%;
					}
				}
			}
		}
	}

	/* 角色 */
	.card-character {
		.card-character-title {
			margin: 0 auto 30px auto;
			padding: 12px 0;
			border-bottom: 4px solid #d6c2b1;
			font-size: 36px;
			text-align: center;
			color: #666;
		}

		.character-line {
			display: grid;
			grid-template-columns: repeat(7, auto);
			grid-row-gap: 15px;
			justify-content: space-between;
			justify-items: center;
		}
	}

	.sign {
		margin: 20px -14px -34px 0;
		font-size: 24px;
		color: #636363;
		text-align: right;
	}
}
</style>