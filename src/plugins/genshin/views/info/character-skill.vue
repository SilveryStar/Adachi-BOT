<script lang="ts" setup>
import InfoCard from "./info-card.vue";
import { CharacterInfo } from "#/genshin/types";
import { computed } from "vue";

const props = defineProps<{
	data: CharacterInfo;
}>();

const skill = computed(() => {
	return props.data.skills.find( sk => sk.icon === "skill_2" )!;
});

const burst = computed(() => {
	return props.data.skills.find( sk => sk.icon === "skill_4" )!;
});
</script>

<template>
	<div class="character-skill">
		<info-card class="skill-card">
			<h3 class="skill-card-title">{{ skill.name }}</h3>
			<div class="skill-card-content" v-html="skill.desc"></div>
		</info-card>
		<info-card class="burst-card">
			<h3 class="skill-card-title">{{ burst.name }}</h3>
			<div class="skill-card-content" v-html="burst.desc"></div>
		</info-card>
	</div>
</template>

<style lang="scss" scoped>
.character-skill {
	display: flex;
	justify-content: space-between;
	padding-bottom: 30px;

	.info-card {
		width: 400px;

		> ::v-deep(.card-content) {
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

		::v-deep(.skill-card-content) {
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