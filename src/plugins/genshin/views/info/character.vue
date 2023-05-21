<script lang="ts" setup>
import CharacterNormal from "./character-normal.vue";
import CharacterSkill from "./character-skill.vue";
import { CharacterInfo } from "#/genshin/types";

const props = defineProps<{
	data: CharacterInfo;
	skill: boolean;
}>();
</script>

<template>
	<div class="character">
		<character-skill v-if="skill" :data="data"></character-skill>
		<character-normal v-else :data="data"></character-normal>
	</div>
</template>

<style lang="scss" scoped>

</style>