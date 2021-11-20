const template =
`<div class="artifact">
    <img class="background" :src="artifactBackground" alt="ERROR"/>
    <div class="up">
        <p class="name">{{ data.name }}</p>
        <p class="slot">{{ data.slot }}</p>
        <div class="main-stat">
            <p class="property">{{ data.mainStat.name }}</p>
            <p class="value">{{ data.mainStat.value }}</p>
        </div>
        <img class="rarity" :src="rarityIcon" alt="ERROR"/>
        <img class="image" :src="data.image" alt="ERROR"/>
    </div>
    <div class="down">
        <p class="level">+{{ data.level }}</p>
        <ul class="sub-stats" v-for="s in data.subStats">
            <li class="pair">{{ s.name }}+{{ s.value }}</li>
        </ul>
    </div>
</div>`;

import { parseURL, request } from "../../public/js/src.js";
const { defineComponent, computed } = Vue;

export default defineComponent( {
	name: "ArtifactApp",
	template,
	setup() {
		const artifactBackground = computed( () => {
			return "https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/module/artifact.png";
		} );
		const rarityIcon = computed( () => {
			return "https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/artifact/other/rarity.png";
		} );
		
		const urlParams = parseURL( location.search );
		const data = request( `/api/artifact?qq=${ urlParams.qq }&type=${ urlParams.type }` );
		
		return {
			data,
			artifactBackground,
			rarityIcon
		}
	}
} );