<script lang="ts" setup>
import { computed } from "vue";
import { AbyssRoom } from "#/genshin/types";

const props = defineProps<{
	data: AbyssRoom;
}>();

/* 是否为空数据 */
const isEmpty = computed( () => !props.data?.battles || !props.data?.battles.length );

/* 获取当前时间 */
const stamp2date = computed( () => {
	if ( isEmpty.value ) return "";
	const date = new Date( parseInt( props.data.battles[0].timestamp ) * 1000 );
	return date.toLocaleDateString().replace( /\//g, "-" ) + " " + date.toTimeString().split( " " )[0];
} );

/* 获取角色小头 */
const getSideIcon = name => `/assets/genshin/character/${ name }/image/side.png`;
</script>

<template>
	<div class="room">
		<header class="room-header">
			<span class="room-title">第{{ [ "一", "二", "三" ][data.index - 1] }}间</span>
			<span class="room-date">{{ stamp2date }}</span>
		</header>
		<article class="room-content">
			<template v-if="!isEmpty">
				<ul class="chara-list">
					<li v-for="(b, bKey) of data.battles" :key="bKey">
						<div v-for="(c, cKey) of b.avatars" :key="cKey" class="chara-box">
							<span>{{ c.level }}</span>
							<img :src="getSideIcon(c.name)" alt="ERROR">
						</div>
					</li>
				</ul>
				<div class="star-box">
					<img v-for="(s, sKey) of data.maxStar" :key="sKey" :class="{'star-crush': s > data.star}"
					     src="/assets/genshin/resource/abyss/star.png" alt="ERROR"/>
				</div>
			</template>
			<p v-else class="empty-massage">暂无挑战数据</p>
		</article>
	</div>
</template>

<style lang="scss" scoped>
.room {
	padding: 24px 0 24px 5px;
	/* 间标题 */
	.room-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		text-shadow: 3px 2px 1px rgba(0, 0, 0, 1);

		.room-title {
			padding-left: 8px;
			border-left: 3px solid #fff;
			font-size: 18px;
		}

		.room-date {
			font-size: 14px;
		}
	}

	/* 间内容 */
	.room-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: 16px;
		height: 126px;

		.chara-list {
			position: relative;
			padding: 7px 20px;
			width: 254px;
			height: 100%;
			box-sizing: border-box;

			&::before {
				content: "";
				position: absolute;
				width: 100%;
				height: 100%;
				left: 17px;
				top: 0;
				border-radius: 16px;
				box-shadow: 2px 2px 6px 3px rgba(0, 0, 0, .35) inset;
				transform: skewX(-12.5deg);
			}

			li {
				display: flex;
				padding: 5px 0;
				align-items: center;
				height: 50%;
				box-sizing: border-box;

				&:first-child {
					position: relative;
					padding-bottom: 10px;
					left: 17px;
					border-bottom: 1px solid rgba(255, 255, 255, .1);

					&::after {
						content: "";
						position: absolute;
						width: 100%;
						height: 1px;
						left: 0;
						bottom: 0;
						background-color: rgba(255, 255, 255, .1);
						box-shadow: 1px 1px 1px 1px rgba(0, 0, 0, .15);
					}
				}

				.chara-box {
					position: relative;
					left: 6px;
					width: 25%;

					span {
						position: absolute;
						padding: 0 5px;
						height: 16px;
						right: -4px;
						top: 0;
						border-radius: 8px;
						background-color: rgba(231, 123, 65, .9);
						font-size: 12px;
						line-height: 16px;
						box-shadow: 1px 1px 1px 1px rgba(0, 0, 0, .35);
						z-index: 100;
					}

					img {
						height: 46px;
						filter: drop-shadow(2px 2px 1px rgba(0, 0, 0, .55));
					}
				}
			}
		}

		/* 星星 */
		.star-box {
			display: flex;
			align-items: center;

			img {
				width: 27px;
				filter: brightness(200%);

				&.star-crush {
					opacity: 0.4;
				}
			}
		}

		/* 空数据文字 */
		.empty-massage {
			flex: 1;
			font-size: 26px;
			text-align: center;
			text-shadow: 3px 2px 1px rgb(0 0 0);
		}
	}
}
</style>