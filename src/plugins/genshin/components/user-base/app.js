const template = `
<div class="card-base">
	<Header
		:data="data"
		:url-params="urlParams"
		:info-list="statsList.base"
	/>
	<main>
		<section class="card-user">
			<article class="card-user-info">
				<SectionTitle>数据总览</SectionTitle>
				<div class="card-status-box">
					<StatusBox
						class="card-status-item"
						v-for="(status, index) in statsList.chest.concat(statsList.culus)"
						:key="index"
						:data="status"
					/>
				</div>
			</article>
			<article class="card-exploration">
				<SectionTitle>世界探索</SectionTitle>
				<div class="card-exploration-box">
					<ExplorationBox
						class="card-exploration-item"
						v-for="(exploration, index) in explorationsList"
						:key="index"
						:data="exploration"
					/>
				</div>
			</article>
		</section>
		<section class="card-character">
			<SectionTitle showSubTitle>
				<template #default>角色展示</template>
				<template #sub>角色数量: {{ data.stats.avatarNumber }}</template>
			</SectionTitle>
			<div class="character-line">
				<CharacterBox
					class="character-item"
					v-for="(char, charIndex) in data.avatars"
					:key="charIndex"
					:char="char"
					type="weaponA"
				/>
			</div>
		</section>
		<section class="card-home">
			<SectionTitle showSubTitle>
				<template #default>尘歌壶</template>
				<template #sub>等级: Lv.{{ homesLevel }} 仙力: {{ maxComfort }}</template>
			</SectionTitle>
			<div class="card-home-box">
				<HomeBox
					class="card-home-item"
					:class="sizeClass(formatHomes, index)"
					v-for="(home, index) of formatHomes"
					:key="index"
					:data="home"
				/>
			</div>
		</section>
		<p class="sign">Created by Adachi-BOT</p>
	</main>
</div>`;

import Header from "./header.js";
import SectionTitle from "./section-title.js";
import HomeBox from "../card/home-box.js";
import CharacterBox from "../card/character-box.js";
import ExplorationBox from "../card/exploration-box.js";
import StatusBox from "../card/status-box.js";
import { parseURL, request } from "../../public/js/src.js";
import { sizeClass, cardDataParser } from "../../public/js/card-data-parser.js";

const { defineComponent } = Vue;

export default defineComponent( {
	name: "CardApp",
	template,
	components: {
		Header,
		SectionTitle,
		HomeBox,
		CharacterBox,
		ExplorationBox,
		StatusBox,
	},
	setup() {
		const urlParams = parseURL( location.search );
		const data = request( `/api/card?qq=${ urlParams.qq }` );
		
		const parsed = cardDataParser( data );
		parsed.data.avatars.splice( 8 );
		
		return {
			...parsed,
			urlParams,
			sizeClass
		};
	},
} );
