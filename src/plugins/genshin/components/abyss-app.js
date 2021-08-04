const template = `
<div class="abyss" :style="bg_style">
	<h1> UID {{ uid }} 的深渊战绩 <span style="font-size: smaller"> {{ time_duration }} </span></h1>
	<div class="overview-stat alt-bg">
		<span> 最深抵达：&nbsp <span class="overview-result"> {{ overview.max_floor }} </span> </span> 
		<span> 战斗次数：&nbsp <span class="overview-result"> {{ overview.total_battle_times }} </span> </span> 
		<span> 获胜次数：&nbsp <span class="overview-result"> {{ overview.total_win_times }} </span> </span> 
		<span>
			<img src="/public/images/abyss/star.png" style="height:100%"/>
			<span class="overview-result" style="margin-left:8px;"> {{ overview.total_star }} </span>
		</span>
	</div>
	<AbyssUpper
		:reveal_rank="overview.reveal_rank"
    ></AbyssUpper>
	<AbyssMiddle
		:defeat_rank="overview.defeat_rank"
		:damage_rank="overview.damage_rank"
		:take_damage_rank="overview.take_damage_rank"
		:normal_skill_rank="overview.normal_skill_rank"
		:energy_skill_rank="overview.energy_skill_rank"
	></AbyssMiddle>
	<div class="abyss-footer">
    	Created By Adachi-BOT
	</div>
</div>`;

import Vue from "../public/js/vue.js";
import AbyssUpper from "./abyss-upper.js";
import AbyssMiddle from "./abyss-middle.js";
import { parseURL, request } from "../public/js/src.js";

function timeStamp2DateStr( unixTimestamp ) {
	const dateObject = new Date( unixTimestamp * 1000 );
	return ( dateObject.getMonth() + 1 ) + "." + dateObject.getDate();
}

export default Vue.defineComponent( {
	name: "AbyssApp",
	template,
	components: {
		AbyssUpper,
		AbyssMiddle
	},
	setup() {
		const bgStyle = Vue.computed( () => {
			const imageUrl = "/public/images/abyss/abyss_background.png";
			const bgImage = "background: linear-gradient(to bottom, transparent 260px, rgb(47, 77, 111) 340px)," +
				"url(" + imageUrl + ") top/100% no-repeat;";
			return bgImage;
		} );
		
		const urlParams = parseURL( location.search );
		
		const uid = urlParams.uid;
		const data = request( `/api/abyss?uid=${ uid }` );
		const overview = JSON.parse( data[urlParams.period] );
		const timeDuration = timeStamp2DateStr( overview.start_time ) + " - " + timeStamp2DateStr( overview.end_time );
		
		return {
			bg_style: bgStyle,
			uid,
			time_duration: timeDuration,
			overview,
		}
	}
} );