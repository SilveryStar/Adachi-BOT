<script lang="ts" setup>
import { onMounted, ref, Ref } from "vue";
import $https from "#/genshin/front-utils/api";
import AlmanacHeader from "./header.vue";
import AlmanacFortune from "./fortune.vue";
import AlmanacFooter from "./footer.vue";
import { Almanac } from "#/genshin/types/almanac";

const data: Ref<Almanac | null> = ref( null );

const getData = async () => {
	data.value = await $https.ALMANAC.get();
}

onMounted( () => {
	getData();
} );
</script>

<template>
	<div id="app" class="almanac">
		<almanac-header/>
		<div class="today-fortune">
			<div class="container">
				<almanac-fortune v-if="data" :data="data.auspicious" :isTop="true"/>
				<almanac-fortune v-if="data" :data="data.inauspicious"/>
			</div>
		</div>
		<almanac-footer v-if="data" :data="data.direction"/>
	</div>
</template>

<style src="../../assets/styles/reset.css"></style>

<style lang="scss" scoped>
#app {
	width: 440px;
	height: 650px;
}

.almanac {
	position: relative;
	width: 100%;
	height: 100%;
	border: 10px solid rgb(214, 208, 192);
	border-radius: 10px;
	background-color: rgb(252, 253, 250);
	box-sizing: border-box;
}

.today-fortune {
	position: relative;
	height: 280px;
	width: calc(100% - 40px);
	margin: 20px auto 0 auto;
	border: 1.5px solid rgb(129, 118, 96);
	box-sizing: border-box;
}

.container {
	position: relative;
	margin: 5px;
	width: calc(100% - 10px);
	height: calc(100% - 10px);
	border: 1px solid rgb(161, 159, 147);
}
</style>