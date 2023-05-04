<template>
	<div class="character-skill">
		<info-card class="skill-card">
			<h3 class="skill-card-title">{{ data.skill.title }}</h3>
			<div class="skill-card-content" v-html="data.skill.description"></div>
		</info-card>
		<info-card class="burst-card">
			<h3 class="skill-card-title">{{ data.burst.title }}</h3>
			<div class="skill-card-content" v-html="data.burst.description"></div>
		</info-card>
	</div>
</template>

<script lang="ts" setup>
import InfoCard from "./info-card.vue";
import { CharacterData } from "#/genshin/views/info/index.vue";

const props = withDefaults( defineProps<{
	data: CharacterData;
}>(), {
	data: () => ( {
		birthday: "",
		element: "",
		cv: "",
		constellationName: "",
		rarity: null,
		mainStat: "",
		mainValue: "",
		baseHP: null,
		baseATK: null,
		baseDEF: null,
		ascensionMaterials: [],
		levelUpMaterials: [],
		talentMaterials: [],
		constellations: [],
		skill: {
			title: "",
			description: ""
		},
		burst: {
			title: "",
			description: ""
		},
		time: ""
	} )
} );
</script>

<style lang="scss" scoped>
.character-skill {
	display: flex;
	justify-content: space-between;
	padding-bottom: 30px;

	.info-card {
		width: 400px;

		&.skill-card > .card-content,
		&.burst-card > .card-content {
			padding: 20px;
			height: 100%;
			min-height: 415px;
		}

		.skill-card-title {
			margin-bottom: 10px;
			font-size: 24px;
			font-weight: 500;
			color: var(--light-color);
		}

		.skill-card-content {
			word-break: break-all;
			font-size: 14px;
			color: #666;

			span[style] {
				margin: 4px 0;
				display: inline-block;
				font-size: 16px;
				color: var(--light-color) !important;
			}

			ul {
				margin: 1em 0;
				padding-left: 40px;
			}
		}
	}
}
</style>