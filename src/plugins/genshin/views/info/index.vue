<script lang="ts" setup>
import { onMounted, ref } from "vue";
import $https from "#/genshin/front-utils/api";
import { initBaseColor } from "#/genshin/front-utils/data-parser";
import InfoBase from "./base.vue";
import InfoWeapon from "./weapon.vue";
import InfoCharacter from "./character.vue";
import { urlParamsGet } from "@/utils/common";
import { InfoResponse } from "#/genshin/types";

const urlParams = urlParamsGet( location.href );
const skill = urlParams.skill === "true";

const data = ref<InfoResponse | null>( null );

const getData = async () => {
	const res = await $https.INFO.get( { name: urlParams.name } );
	initBaseColor( res );
	data.value = res;
}

onMounted( () => {
	getData();
} );
</script>

<template>
	<div id="app">
		<info-base v-if="data" :data="data">
			<info-character v-if="data.type === '角色'" :data="data" :skill="skill"></info-character>
			<info-weapon v-else :data="data"></info-weapon>
		</info-base>
	</div>
</template>

<style src="../../assets/styles/reset.css"></style>

<style lang="scss" scoped>
#app {
	width: 1440px;
}
</style>