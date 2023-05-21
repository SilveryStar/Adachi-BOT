<script lang="ts" setup>
import { onMounted, ref } from "vue";
import $https from "#/genshin/front-utils/api";
import Base from "./base.vue";
import AbyssOverview from "./overview.vue";
import AbyssFloor from "./floor.vue";
import { urlParamsGet } from "@/utils/common";
import { AbyssRouterFloor, AbyssRouterOverview } from "#/genshin/types";

const urlParams = <{ qq: string; floor: string; }>urlParamsGet( location.href );

const data = ref<AbyssRouterOverview | AbyssRouterFloor | null>( null );

function checkOverview( data: AbyssRouterOverview | AbyssRouterFloor ): data is AbyssRouterOverview {
	return data.floor === "0";
}

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

<template>
	<Base v-if="data" :data="data" id="app">
		<abyss-overview v-if="checkOverview(data)" :data="data"/>
		<abyss-floor v-else :data="data"/>
	</Base>
</template>

<style src="../../assets/styles/reset.css"></style>

<style lang="scss" scoped>
#app {
	width: 1000px;
}
</style>