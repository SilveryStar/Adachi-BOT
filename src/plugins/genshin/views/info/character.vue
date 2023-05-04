<template>
	<div class="character">
		<character-skill v-if="skill" :data="data"></character-skill>
		<character-normal v-else :data="data"></character-normal>
	</div>
</template>

<script lang="ts" setup>
import CharacterNormal from "./character-normal.vue";
import CharacterSkill from "./character-skill.vue";
import { CharacterData } from "#/genshin/views/info/index.vue";

const props = withDefaults( defineProps<{
	data: CharacterData;
	skill: boolean;
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
	} ),
	skill: false
} );
</script>

<style lang="scss" scoped>

</style>