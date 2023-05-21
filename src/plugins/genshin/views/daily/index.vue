<script lang="ts" setup>
import { DailyRouter } from "#/genshin/types/daily";
import "moment/dist/locale/zh-cn";
import { computed, onMounted, ref } from "vue";
import $https from "#/genshin/front-utils/api";
import DailyHeader from "./daily-header.vue";
import Material from "./material.vue";
import Event from "./event.vue";
import { urlParamsGet } from "@/utils/common";

const urlParams = urlParamsGet( location.href );
const user: string = urlParams.id;

const data = ref<DailyRouter | null>( null );

const week: string = urlParams.week;
const subState = computed<boolean>( () => urlParams.type === "sub" );

const objHasValue = ( params: string ) => {
	const d = data.value;
	if ( !d || !d[params] || typeof d[params] !== "object" ) return false;
	return Object.keys( d[params] ).length !== 0;
}

/* 是否显示素材（素材空） */
const showMaterial = computed<boolean>( () => objHasValue( "character" ) || objHasValue( "weapon" ) );

/* 是否显示活动日历 */
const showEvent = computed<boolean>( () => week === "today" && data.value?.event.length !== 0 );

const getData = async () => {
	data.value = await $https.DAILY.get( { id: user } );
};

onMounted( () => {
	getData();
} );
</script>

<template>
	<div id="app" class="daily-app">
		<daily-header :week="week" :show-event="showEvent" :sub-state="subState" :user="user"/>
		<Material v-if="data && showMaterial" :data="data"/>
		<Event v-if="data && data.event" :show-event="showEvent" :show-material="showMaterial" :events="data.event"/>
	</div>
</template>

<style src="../../assets/styles/reset.css"></style>

<style lang="scss" scoped>
#app {
	width: 1180px;
	--primary-base: #F9F5F1;
	--primary-dark: #886444;
	--shadow-base: rgba(136, 100, 68, 0.2);
	--shadow-dark: rgba(136, 100, 68, 1);
}
</style>