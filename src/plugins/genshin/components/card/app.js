const template = `<div class="card-base">
	<CardHeader
		:data="data"
		:url-params="urlParams"
		:info-list="statsList.base"
	/>
	<main>
		<section class="card-user">
			<article class="card-user-info">
				<h3 class="card-title">数据总览</h3>
				<div class="card-status-box">
					<StatusBox
						v-for="(status, index) in statsList.chest.concat(statsList.culus)"
						:key="index"
						:data="status"
					/>
				</div>
			</article>
			<article class="card-exploration">
				<h3 class="card-title">世界探索</h3>
				<div class="card-exploration-box">
					<ExplorationBox
						v-for="(exploration, index) in explorationsList"
						:key="index"
						:class="sizeClass(explorationsList, index)"
						class="card-exploration-item"
						:data="exploration"
					/>
				</div>
			</article>
		</section>
		<section class="card-home">
			<h3 class="card-title">尘歌壶</h3>
			<div class="card-home-box">
				<p class="card-home-info">等级: Lv.{{ homesLevel }} 仙力: {{ maxComfort }}</p>
				<div class="card-home-list">
					<HomeBox
						class="card-home-item"
						:class="sizeClass(formatHomes, index)"
						v-for="(home, index) of formatHomes"
						:key="index"
						:data="home"
					/>
				</div>
			</div>
		</section>
		<section class="card-character">
			<h1 class="card-character-title">角色背包</h1>
			<div class="character-line">
				<CharacterBox
					class="character-item"
					v-for="(char, charIndex) in data.avatars"
					:key="charIndex"
					:char="char"
					:type="urlParams.style"
				/>
			</div>
			<p class="sign">Created by Adachi-BOT</p>
		</section>
	</main>
</div>`;

import CardHeader from "./card-header.js";
import HomeBox from "./home-box.js";
import CharacterBox from "./character-box.js";
import ExplorationBox from "./exploration-box.js";
import StatusBox from "./status-box.js";
import { parseURL, request } from "../../public/js/src.js";
import { sizeClass, cardDataParser } from "../../public/js/card-data-parser.js";

const { defineComponent } = Vue;

export default defineComponent( {
	name: "CardApp",
	template,
	components: {
		CardHeader,
		HomeBox,
		CharacterBox,
		ExplorationBox,
		StatusBox,
	},
	setup() {
		const urlParams = parseURL( location.search );
		const data = request( `/api/card?qq=${ urlParams.qq }` );
		
		const parsed = cardDataParser( data );
		
		return {
			...parsed,
			urlParams,
			sizeClass: sizeClass( 4 ),
		};
	},
} );
