<template>
	<div class="character-weapon">
		<div class="weapon-avatar-box" :style="{'background-image': getRarityBg(weapon.rarity)}">
			<img class="icon" :src="weapon.icon" alt="ERROR"/>
		</div>
		<div class="weapon-detail">
			<p class="w-name">{{ weapon.name }}</p>
			<p class="w-info">
				<span class="level">Lv.{{ weapon.level }}</span>
				<span class="refine" :class="getAffixClass(weapon.rarity)">精炼{{ weapon.affixLevel }}阶</span>
			</p>
		</div>
	</div>
</template>

<script lang="ts" setup>
const props = withDefaults( defineProps<{
	weapon: Record<string, any>;
	getRarityBg: ( rarity: number ) => string;
}>(), {
	weapon: () => ( {} )
} );

/* 针对联动处理 */
function getAffixClass( rarity ) {
	rarity = rarity === 105 ? "5a" : rarity;
	return `affix_${ rarity }`;
}
</script>

<style lang="scss" scoped>
.character-weapon {
	display: flex;
	align-items: center;
	font-size: 10px;

	.weapon-avatar-box {
		position: relative;
		width: 4.2em;
		margin-left: 0.4em;
		border-radius: 0.4em;
		background-repeat: no-repeat;
		background-size: cover;

		.icon {
			width: 100%;
		}
	}

	.weapon-detail {
		margin: 0.43em 0;
		flex: 1;
		font-size: 1.4em;
		line-height: 1.29em;
		text-align: center;

		.w-info {
			display: flex;
			justify-content: center;
			align-items: center;
		}

		.level {
			vertical-align: middle;
			font-size: 0.86em;
		}

		.refine {
			margin-left: 0.29em;
			vertical-align: middle;

			&.affix_1 {
				color: #a4a4a4;
			}

			&.affix_2 {
				color: #5d8c81;
			}

			&.affix_3 {
				color: #6faaca;
			}

			&.affix_4 {
				color: #917ab1;
			}

			&.affix_5 {
				color: #de9552;
			}

			&.affix_5a {
				color: #af5155;
			}
		}
	}
}
</style>