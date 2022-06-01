const template = `<div class="abyss-single">
	<header>
		<div class="user-info-box">
			<div class="user-info-container">
				<img :src="avatar" alt="ERROR">
				<div class="user-info">
					<p>{{ data.userName }}</p>
					<p>UID {{ data.uid }}</p>
				</div>
			</div>
			<ul class="tag-list">
				<li>
					<img src="https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/abyss/star.png" alt="ERROR">
					<span>{{ data.totalStar }}</span>
				</li>
				<li>
					<span>最深抵达</span>
					<span>{{ data.maxFloor }}</span>
				</li>
				<li>
					<span>挑战次数</span>
					<span>{{ data.totalBattleTimes }}</span>
				</li>
			</ul>
		</div>
		<Reveal :data="reveals"></Reveal>
	</header>
	<main>
		<Overview v-if="showData" :data="dataList"></Overview>
		<div class="floors-data">
			<Floor v-for="(f, fKey) of floors" :key="fKey" :data="f"></Floor>
		</div>
	</main>
	<footer>
		<p class="author">Created by Adachi-BOT</p>
	</footer>
</div>`;

import { parseURL, request } from "../../public/js/src.js";
import { abyssDataParser } from "../../public/js/abyss-data-parser.js"
import Reveal from "./reveal.js";
import Overview from "./overview.js";
import Floor from "./floor.js";

const { defineComponent } = Vue;

export default defineComponent( {
	name: "AbyssSingle",
	template,
	components: {
		Reveal,
		Overview,
		Floor
	},
	setup() {
		const urlParams = parseURL( location.search );
		const data = request( `/api/abyss/single?qq=${ urlParams.qq }` );
		
		/* 获取9-12层数据，无数据使用默认数据填充 */
		const floors = new Array(4).fill('').map((fake, fKey) => {
			const index = fKey + 9;
			const floor = data.floors?.find(f => f.index === index);
			return floor || {
				index,
				levels: []
			}
		});
		
		const parsed = abyssDataParser( data );
		
		/* 获取头像 */
		const avatar = `https://q1.qlogo.cn/g?b=qq&s=640&nk=${ urlParams.qq }`;
		
		return {
			...parsed,
			data,
			floors,
			avatar
		};
	}
} )