<script lang="ts" setup>
import { computed } from "vue";
import SectionTitle from "#/genshin/components/section-title/index.vue";
import CharacterItem from "./character-item.vue";
import { AbyssRoom } from "#/genshin/types";

const props = defineProps<{
	roomData: AbyssRoom;
}>();

const stamp2date = computed( () => {
	if ( !props.roomData ) return "";
	const date = new Date( parseInt( props.roomData.battles[0].timestamp ) * 1000 );
	return date.toLocaleDateString().replace( /\//g, "-" ) + " " + date.toTimeString().split( " " )[0];
} );
</script>

<template>
	<div class="abyss-room" v-if="roomData">
		<SectionTitle showSubTitle>
			<template #default>第{{ [ "一", "二", "三" ][roomData.index - 1] }}间</template>
			<template #sub>
				<img
					v-for="item of roomData.maxStar"
					:key="item"
					:class="{'star-crush': item > roomData.star}"
					src="/assets/genshin/resource/abyss/star.png" alt="ERROR"
				>
			</template>
		</SectionTitle>
		<span class="time">{{ stamp2date }}</span>
		<div class="room-info">
			<div v-for="(harf, harfIndex) of roomData.battles" :key="harfIndex" class="room-info-half">
				<h3>{{ [ "上半", "下半" ][harfIndex] }}</h3>
				<div class="character-list">
					<template v-for="(char, index) in harf.avatars" :key="index">
						<CharacterItem class="character-item" :char="char" type="level"/>
						<img
							src="/assets/genshin/resource/abyss/diamond.png"
							alt="ERROR"
						/>
					</template>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.abyss-room {
	position: relative;
	/* 标题 */
	:deep(.sub-title) {
		display: flex;

		img {
			width: 28px;
			filter: brightness(200%);

			&.star-crush {
				opacity: 0.4;
			}
		}
	}

	/* 时间 */
	.time {
		position: absolute;
		right: 102px;
		top: 34px;
		font-size: 16px;
		color: #fff;
	}

	/* 队伍详细 */
	.room-info {
		width: 800px;
		margin: -10px auto 0;

		.room-info-half {
			margin-bottom: 18px;

			&:last-child {
				margin-bottom: 0;
			}

			h3 {
				margin-bottom: 14px;
				padding: 0 4px;
				border-left: 5px solid #fff;
				color: #fff;
				font-size: 18px;
				line-height: 18px;
				font-weight: normal;
			}

			.character-list {
				display: flex;
				justify-content: space-between;
				align-items: center;

				img {
					&:last-child {
						display: none;
					}
				}

				.character-item {
					font-size: 10.566px;
				}
			}
		}
	}
}
</style>