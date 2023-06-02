<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import $https from "#/genshin/front-utils/api";
import { ArtifactRouter } from "#/genshin/types";
import { urlParamsGet } from "@/utils/url";

const urlParams = <{ qq: string; type: string; }>urlParamsGet( location.href );
const data = ref<ArtifactRouter | null>( null );

const icon = computed( () => {
	const value = data.value;
	if ( !value ) return "";
	return `/assets/genshin/artifact/${ value.shirt }/image/${ value.icon }.png`;
} );

async function getData() {
	data.value = await $https.ARTIFACT.get( {
		qq: urlParams.qq,
		type: urlParams.type
	} );
}

onMounted( () => {
	getData();
} )
</script>

<template>
	<div id="app" class="artifact">
		<img class="background" src="/assets/genshin/resource/artifact/background.png" alt="ERROR"/>
		<div class="up">
			<p class="name">{{ data?.name }}</p>
			<p class="slot">{{ data?.slot }}</p>
			<div class="main-stat">
				<p class="property">{{ data?.mainStat.name }}</p>
				<p class="value">{{ data?.mainStat.value }}</p>
			</div>
			<img class="rarity" src="/assets/genshin/resource/rarity/icon/Icon_5_Stars.png" alt="ERROR"/>
			<img class="image" :src="icon" alt="ERROR"/>
		</div>
		<div class="down">
			<p class="level">+{{ data?.level }}</p>
			<ul class="sub-stats" v-for="s in data?.subStats">
				<li class="pair">{{ s.name }}+{{ s.value }}</li>
			</ul>
		</div>
	</div>
</template>

<style src="../../assets/styles/reset.css"></style>

<style scoped lang="scss">
.artifact {
	.background {
		position: absolute;
	}

	.up,
	.down {
		position: relative;
	}

	.up {
		.name {
			position: relative;
			color: white;
			font-size: 45px;
			left: 45px;
			top: 18px;
		}

		.slot {
			position: relative;
			color: white;
			font-size: 28px;
			left: 38px;
			top: 50px;
		}

		.main-stat {
			position: relative;
			left: 38px;
			top: 168px;

			.property {
				position: relative;
				color: rgb(191, 175, 169);
				font-size: 28px;
			}

			.value {
				position: relative;
				color: white;
				font-size: 55px;
			}
		}

		.rarity {
			position: relative;
			height: 52px;
			left: 31px;
			top: 171px;
		}

		.image {
			position: relative;
			left: 408px;
			top: -142px;
			width: 320px;
		}
	}

	.down {
		.level {
			position: relative;
			color: white;
			font-size: 31px;
			top: -81px;
			left: 45px;
			width: 80px;
			text-align: center;
		}

		.sub-stats {
			position: relative;
			top: -57px;
			left: 76px;
			list-style: none;
			font-size: 30px;
			line-height: 50px;
			color: rgb(73, 83, 102);
		}
	}
}
</style>