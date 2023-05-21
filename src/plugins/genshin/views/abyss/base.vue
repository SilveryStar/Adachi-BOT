<script lang="ts" setup>
import { computed } from "vue";
import { AbyssRouterFloor, AbyssRouterOverview } from "#/genshin/types";

const props = defineProps<{
	data: AbyssRouterOverview | AbyssRouterFloor
}>();

const uid = computed( () => props.data.info.split( "-" ).join( " " ) );
</script>

<template>
	<div class="abyss-base">
		<span class="uid">{{ uid }}</span>
		<slot/>
		<p class="footer">Created by Adachi-BOT</p>
	</div>
</template>

<style lang="scss" scoped>
.abyss-base {
	position: relative;
	background: url("/assets/genshin/resource/abyss/top-background.jpg") top #13132b no-repeat;
	background-size: contain;
	overflow: hidden;

	&::before {
		content: "";
		position: absolute;
		left: 0;
		top: 0;
		right: 0;
		bottom: 0;
		border: 70px solid;
		border-image-source: url("/assets/genshin/resource/card/card-base-bg.png");
		border-image-slice: 70 fill;
		filter: brightness(200%);
		opacity: 0.6;
	}

	.uid {
		position: absolute;
		font-size: 20px;
		color: #fff;
		left: 64px;
		top: 60px;
	}

	.footer {
		margin: 42px 62px;
		font-size: 24px;
		color: #fff;
		text-align: right;
	}
}
</style>