<template>
	<div class="character-item">
		<div class="avatar-box" :style="{'background-image': getRarityBg}">
			<img class="profile" :src="char && char.icon" alt="ERROR"/>
		</div>
		<p class="detail">
			<span class="level">{{ getStr }}</span>
		</p>
	</div>
</template>

<script lang="ts" setup>
import { AbyssBattleAvatar } from "#/genshin/types";
import { computed } from "vue";

const props = withDefaults( defineProps<{
	char: AbyssBattleAvatar;
	type?: "reveal" | "level"
}>(), {
	type: "level"
} );

/* 针对埃洛伊处理 */
const getRarityBg = computed(() => {
	if ( !props.char ) return "";
	const rarity = props.char.rarity === 105 ? "5a" : props.char.rarity;
	return `url(/assets/genshin/resource/rarity/bg/Background_Item_${ rarity }_Star.png)`;
});

const getStr = computed( () => {
	if ( !props.char ) return "";
	return props.type === "level" ? "Lv." + props.char.level : props.char.value + "次";
} );
</script>

<style lang="scss" scoped>
.character-item {
	display: inline-flex;
	flex-direction: column;
	align-items: center;
	width: 15.9em;
	min-height: 19.2em;
	border-radius: 0.8em;
	background-color: #e9e5dc;
	box-sizing: border-box;
	color: rgb(64, 64, 64);
	font-size: 10px;
	/* 头像 */
	.avatar-box {
		background-repeat: no-repeat;
		background-size: cover;
		border-radius: 0.6em 0.6em 3.2em 0;
		overflow: hidden;
		z-index: 10;

		.profile {
			width: 100%;
			z-index: 10;
		}
	}

	/* lv */
	.detail {
		width: 100%;
		text-align: center;

		.level {
			font-size: 1.8em;
			line-height: 1.85em;
			margin-bottom: 0.25em;
			vertical-align: middle;
		}
	}
}
</style>