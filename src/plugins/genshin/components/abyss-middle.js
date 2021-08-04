const template = `
<div class="abyss-middle">
	<h2> 战斗数据榜 </h2>
	<AbyssDataRow :title="'最多击破数'" :rank="defeat_rank" class="alt-bg"/>
	<AbyssDataRow :title="'最强一击'" :rank="damage_rank"/>
	<AbyssDataRow :title="'承受最多伤害'" :rank="take_damage_rank" class="alt-bg" />
	<AbyssDataRow :title="'元素爆发次数'" :rank="energy_skill_rank"/>
	<AbyssDataRow :title="'元素战技释放次数'" :rank="normal_skill_rank" class="alt-bg"/>
</div>`;

import Vue from "../public/js/vue.js";
import AbyssDataRow from "./abyss-data-row.js";

export default Vue.defineComponent( {
	name: "AbyssMiddle",
	template,
	components: {
		AbyssDataRow
	},
	props: {
		defeat_rank: Array,
		damage_rank: Array,
		take_damage_rank: Array,
		normal_skill_rank: Array,
		energy_skill_rank: Array
	}
} );
