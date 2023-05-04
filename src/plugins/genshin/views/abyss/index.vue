<template>
	<Base :data="data" id="app">
		<AbyssOverview v-if="data.floor === '0'" :data="data"/>
		<AbyssFloor v-else :data="data"/>
	</Base>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import $https from "#/genshin/front-utils/api";
import Base from "./base.vue";
import AbyssOverview from "./overview.vue";
import { urlParamsGet } from "@/utils/common";
import { Abyss, AbyssFloors } from "#/genshin/types";

export type OverviewData = Omit<Abyss, "scheduleId" | "startTime" | "totalWinTimes" | "floors" | "isUnlock"> & {
	floor: "0";
	info: string;
}

export interface FloorData {
	floor: string;
	info: string;
	data: AbyssFloors
}

type AbyssData = FloorData & OverviewData;

const urlParams = <{ qq: string; floor: string; }>urlParamsGet( location.href );

const data = ref<AbyssData | null>( null );

async function getData() {
	data.value = await $https.ABYSS.get( {
		qq: urlParams.qq,
		floor: urlParams.floor
	} );
}

onMounted( () => {
	getData();
} )
</script>

<style src="../../public/styles/reset.css"></style>

<style lang="scss" scoped>
#app {
	width: 1000px;
}
</style>