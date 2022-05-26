const template = `<div class="info-artifact">
	<header>
    	<p class="title-and-name">
    		「<span v-show="title">{{ title }}·</span>{{ name }}」
    	</p>
    	<img :src="rarityIcon" alt="ERROR" class="rarity-icon">
	</header>
	<main>
		<div class="avatar-box">
			<img :src="mainImage" alt="ERROR"/>
		</div>
		<div class="main-content">
			<div class="shirt-title">{{ name }}</div>
			<template v-for="(e, eKey) in effects">
				<p class="effect-title">{{ eKey }}件套</p>
				<div class="effect-content" v-html="e"></div>
			</template>
		</div>
		<div class="main-content">
			<p class="access">获取途径: {{ access }}</p>
		</div>
	</main>
	<footer class="author">Created by Adachi-BOT</footer>
</div>`;

import { parseURL, request } from "../../public/js/src.js";
import { initBaseColor, infoDataParser } from "../../public/js/info-data-parser.js";

const { defineComponent, onMounted, toRefs } = Vue;

export default defineComponent( {
	name: "InfoApp",
	template,
	setup() {
		const urlParams = parseURL( location.search );
		const data = request( `/api/info?name=${ urlParams.name }` );
		
		onMounted( () => {
			initBaseColor( data );
		} )
		
		const parsed = infoDataParser( data );
		
		return {
			...parsed,
			...toRefs( data )
		}
	}
} );
