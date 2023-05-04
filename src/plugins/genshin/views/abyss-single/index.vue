<template>
	<div class="abyss-single" id="app" v-if="data">
		<header>
			<div class="user-info-box">
				<div class="user-info-container">
					<img :src="avatar" alt="ERROR">
					<div class="user-info">
						<p>{{ data.userName }}</p>
						<p>UID {{ data.uid }}</p>
					</div>
				</div>
				<ul class="tag-list">
					<li>
						<img src="https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/abyss/star.png" alt="ERROR">
						<span>{{ data.totalStar }}</span>
					</li>
					<li>
						<span>最深抵达</span>
						<span>{{ data.maxFloor }}</span>
					</li>
					<li>
						<span>挑战次数</span>
						<span>{{ data.totalBattleTimes }}</span>
					</li>
				</ul>
			</div>
			<Reveal :data="data.reveals"></Reveal>
		</header>
		<main>
			<Overview v-if="data.showData" :data="data.dataList"></Overview>
			<div class="floors-data">
				<Floor v-for="(f, fKey) of data.floors" :key="fKey" :data="f"></Floor>
			</div>
		</main>
		<footer>
			<p class="author">Created by Chaichai-BOT</p>
		</footer>
	</div>
</template>

<script lang="ts" setup>
import { onMounted, computed, ref } from "vue";
import $https from "#/genshin/front-utils/api";
import Reveal from "./reveal.vue";
import Overview from "./overview.vue";
import Floor from "./floor.vue";
import { urlParamsGet } from "@/utils/common";
import { abyssDataParser } from "#/genshin/front-utils/data-parser";

const urlParams = <{ qq: string }>urlParamsGet( location.href );

/* 获取9-12层数据，无数据使用默认数据填充 */
function getFloors( data: Record<string, any> ) {
	return new Array( 4 ).fill( '' ).map( ( fake, fKey ) => {
		const index = fKey + 9;
		const floor = data?.floors?.find( f => f.index === index );
		return floor || {
			index,
			levels: []
		}
	} );
}

/* 获取头像 */
const avatar = computed( () => `https://q1.qlogo.cn/g?b=qq&s=640&nk=${ urlParams.qq }` );

const data = ref<Record<string, any> | null>( null );

onMounted( async () => {
	const res = await $https.ABYSS_SINGLE.get( { qq: urlParams.qq } );
	data.value = {
		...res,
		...abyssDataParser( res ),
		...getFloors( res )
	}
} );
</script>

<style src="../../public/styles/reset.css"></style>

<style lang="scss" scoped>
ul, p {
	margin: 0;
	padding: 0;
}

ul {
	list-style: none;
}
</style>

<style lang="scss" scoped>
#app {
	width: 1024px;
}

.abyss-single {
	background: url("https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/abyss/top-background.jpg") top center #131425 no-repeat;
	background-size: contain;
	overflow: hidden;
	line-height: 1;
	color: #fff;

	header {
		padding: 0 40px;
		display: flex;
		justify-content: space-between;
		align-items: center;

		.user-info-box {
			padding: 40px 0 28px;

			.user-info-container {
				display: flex;
				margin-bottom: 31px;
				align-items: center;

				img {
					margin-right: 41px;
					width: 134px;
					height: 134px;
					border-radius: 50%;
					box-shadow: 0 0 0 8px rgba(97, 102, 184, .4);
				}

				.user-info {
					text-shadow: 3px 3px 1px rgba(0, 0, 0, 1);

					p {
						&:first-child {
							margin-bottom: 19px;
							font-size: 32px;
						}

						&:last-child {
							font-size: 24px;
						}
					}
				}
			}

			/* 标签列表 */
			.tag-list {
				display: flex;
				align-items: center;

				li {
					display: flex;
					margin-right: 9px;
					padding: 0 16px;
					height: 30px;
					border: 1px solid #fff;
					border-radius: 15px;
					font-size: 18px;
					align-items: center;

					span {
						&:first-child {
							margin-right: 5px;
						}
					}

					&:first-child {
						img {
							margin-right: 4px;
							height: 30px;
							filter: brightness(200%);
						}
					}
				}
			}
		}

		.reveal {
			margin-right: 40px;
		}
	}

	/* 内容部分 */
	main {
		padding: 0 60px;

		.floors-data {
			display: flex;
			margin-top: 60px;
			justify-content: space-between;
			flex-wrap: wrap;

			.floor {
				margin-bottom: 45px;
			}
		}
	}

	/* 底部签名 */
	footer {
		position: relative;
		padding: 20px;

		&::before {
			content: "";
			position: absolute;
			width: 905px;
			height: 4px;
			top: 0;
			left: 50%;
			border-radius: 2px;
			background-color: rgba(97, 102, 184, .3);
			transform: translateX(-50%);
			box-shadow: 2px 2px 2px 2px rgba(0, 0, 0, .3);
		}

		.author {
			margin-top: 5px;
			font-size: 24px;
			text-align: center;
			text-shadow: 4px 3px 1px rgba(0, 0, 0, 1);
		}
	}
}
</style>