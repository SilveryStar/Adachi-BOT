<template>
	<div class="character-box">
		<div class="avatar-box" :style="{'background-image': getRarityBg(char.rarity)}">
			<img
				class="element"
				v-if="char.element !== 'None'"
				:src="getElementIcon(char.element)"
				alt="ERROR"
			/>
			<span v-if="char.activedConstellationNum" class="constellation">{{ char.activedConstellationNum }}</span>
			<div v-if="char.name !== '旅行者'" class="fetter-box">
				<img src="https://adachi-bot.oss-cn-beijing.aliyuncs.com/images/common/Item_Companionship_EXP.png"
				     alt="ERROR"/>
				<span>{{ char.fetter }}</span>
				<span>{{ char.fetter }}</span>
			</div>
			<img class="rarity" :src="getRarity(char.rarity)" alt="ERROR"/>
			<img class="profile" :src="char.icon" alt="ERROR"/>
		</div>
		<p class="detail">
			<span class="name">{{ char.name }}</span>
			<span class="level">Lv.{{ char.level }}</span>
		</p>
		<div class="info planA-style" v-if="type === 'weaponA'">
			<character-weapon
				class="chara-weapon-box"
				:weapon="char.weapon"
				:get-rarity-bg="getRarityBg"
			/>
		</div>
		<div class="info planB-style" v-else-if="type === 'weaponB'">
			<p>
				<span class="weapon">武器: {{ char.weapon.name }}</span>
				<span class="level">Lv.{{ char.weapon.level }}</span>
			</p>
		</div>
	</div>
</template>

<script lang="ts" setup>
import CharacterWeapon from "./character-weapon.vue";

const props = withDefaults( defineProps<{
	char: Record<string, any>;
	type: string;
}>(), {
	char: () => ( {} ),
	type: "normal"
} );

/* 针对埃洛伊处理 */
function getRarity( rarity ) {
	rarity = rarity === 105 ? "5" : rarity;
	return `https://adachi-bot.oss-cn-beijing.aliyuncs.com/images/stars/Icon_${ rarity }_Stars.png`;
}

function getRarityBg( rarity ) {
	rarity = rarity === 105 ? "5a" : rarity;
	return `url(https://adachi-bot.oss-cn-beijing.aliyuncs.com/images/rarity_bg/Background_Item_${ rarity }_Star.png)`;
}

/* 获取属性图标 */
function getElementIcon( element ) {
	return `https://adachi-bot.oss-cn-beijing.aliyuncs.com/images/element/Element_${ element }.png`;
}
</script>

<style lang="scss" scoped>
.character-box {
	--border-color: #cbc0a9;
	position: relative;
	display: inline-flex;
	flex-direction: column;
	align-items: center;
	width: 15.9em;
	min-height: 19.2em;
	border: 0.1em solid var(--border-color);
	border-radius: 0.8em;
	background-color: #e9e5dc;
	box-sizing: border-box;
	font-size: 10px;
	color: rgb(64, 64, 64);

	.profile {
		position: relative;
		width: 13.3em;
		z-index: 10;
	}

	/* 通用 */
	.info {
		width: 100%;
		text-align: center;
	}

	/* 头像 */
	.avatar-box {
		position: relative;
		background-repeat: no-repeat;
		background-size: cover;
		border-radius: 0.6em 0.6em 3.2em 0;
		overflow: hidden;
		z-index: 10;

		.element {
			position: absolute;
			left: 0.4em;
			top: 0.4em;
			width: 3.4em;
			z-index: 100;
		}

		.constellation {
			position: absolute;
			top: 0;
			right: 0;
			width: 1.445em;
			border-radius: 0 0.33em 0 0.33em;
			font-size: 1.8em;
			line-height: 1.78em;
			color: #fff;
			background-color: rgba(0, 0, 0, 0.5);
			text-align: center;
			z-index: 100;
		}

		.fetter-box {
			position: absolute;
			left: 0.4em;
			top: 4.2em;
			z-index: 100;

			img {
				width: 3.4em;
				filter: drop-shadow(0 0 0.2em #333);
			}

			span {
				position: absolute;
				left: 50%;
				top: 50%;
				transform: translate(-50%, -50%);
				font-size: 1.6em;
				color: #fff;

				&:nth-of-type(1) {
					-webkit-text-stroke: 0.19em #6d6092;
				}
			}
		}

		.rarity {
			position: absolute;
			height: 2.4em;
			bottom: -0.4em;
			left: 50%;
			transform: translateX(-50%);
			z-index: 100;
		}

		.profile {
			width: 100%;
		}
	}

	/* 角色名+lv */
	.detail {
		width: 100%;
		margin-top: 0.4em;
		text-align: center;

		.name {
			font-size: 2em;
			margin-right: 0.2em;
			line-height: 1.4em;
			vertical-align: middle;
		}

		.level {
			font-size: 1.6em;
			margin-bottom: 0.25em;
			vertical-align: middle;
		}
	}

	/* weapon-A */
	.planA-style {
		border-top: 0.1em solid var(--border-color);

		.chara-weapon-box {
			font-size: 1em;
		}
	}

	/* weapon-B */
	.planB-style {
		position: relative;
		border-top: 0.1em solid var(--border-color);

		p {
			font-size: 1.3em;
			line-height: 1.6em;

			.level {
				margin-left: 0.31em;
			}
		}
	}
}

.character-data {
	position: relative;
}
</style>