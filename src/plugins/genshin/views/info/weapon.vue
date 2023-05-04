<template>
	<div class="weapon">
		<div class="info-top-base">
			<info-line title="基本属性" :data="dataBlockInfo"></info-line>
			<info-card class="skill-card">
				<h3 class="skill-title">{{ data.skillName }}</h3>
				<div class="skill-content" v-html="data.skillContent"></div>
			</info-card>
		</div>
		<info-card class="materials-card" :title="materialsTitle">
			<materials-list :data="materialsInfo"></materials-list>
		</info-card>
	</div>
</template>

<script lang="ts" setup>
import InfoLine from "./info-line.vue";
import InfoCard from "./info-card.vue";
import MaterialsList from "./materials-list.vue"
import { computed } from "vue";

const props = withDefaults( defineProps<{
	data: {
		access: string,
		rarity: number | null,
		mainStat: string,
		mainValue: string,
		baseATK: number | null,
		ascensionMaterials: any[],
		time: string,
		skillName: string,
		skillContent: string
	}
}>(), {
	data: () => ( {
		access: "",
		rarity: null,
		mainStat: "",
		mainValue: "",
		baseATK: null,
		ascensionMaterials: [],
		time: "",
		skillName: "",
		skillContent: ""
	} )
} );

const materialsTitle = computed( () => `材料消耗${ props.data.time }` );

const materialsInfo = computed( () => ( {
	label: "突破",
	value: props.data.ascensionMaterials?.flat(),
	showTitle: false,
} ) );

const dataBlockInfo = computed( () => [
	{
		基础攻击力: props.data.baseATK,
		[props.data.mainStat]: props.data.mainValue
	},
	{
		来源: props.data.access
	}
] );
</script>

<style lang="scss" scoped>

</style>