const template =
`<div class="statistic-box">
	<p class="time">@{{ nickname }} at {{ fullDate }}</p>
    <span class="main-title">祈愿统计</span>
    <span class="total">总计： {{ total }} 抽</span>
    <div
    	v-show="character.length !== 0"
    	class="gotten"
    >
        <p class="title">抽中角色: {{ charCount }}</p>
        <div class="box">
            <StatisticItem v-for="el in character" :data="el"/>
        </div>
    </div>
    <div
    	v-show="weapon.length !== 0"
    	class="gotten"
    >
        <p class="title">抽中武器: {{ weaponCount }}</p>
        <div class="box">
            <StatisticItem v-for="el in weapon" :data="el"/>
        </div>
    </div>
    <p class="author">Created by Adachi-BOT</p>
</div>`;

import { getFullDate, parseURL, request } from "../../public/js/src.js";
import StatisticItem from "./item.js";
const { defineComponent } = Vue;

export default defineComponent( {
	name: "WishStatistic",
	template,
	components: {
		StatisticItem
	},
	setup() {
		const urlParams = parseURL( location.search );
		const data = request( `/api/wish/statistic?qq=${ urlParams.qq }` );
		
		const weaponCount = data.weapon.reduce( ( pre, cur ) => pre + cur.count, 0 );
		const charCount = data.character.reduce( ( pre, cur ) => pre + cur.count, 0 );
		const fullDate = getFullDate();
		
		return {
			...data,
			weaponCount,
			charCount,
			fullDate
		}
	}
} );
