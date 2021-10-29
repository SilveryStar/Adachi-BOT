const template =
`<div class="almanac-header">
    <img class="title" src="../../public/images/almanac/title.svg" alt="ERROR"/>
    <div class="time">
    	<p class="year">{{ year }}</p>
    	<p class="day">{{ day }}</p>
    	<p class="month">{{ month }}</p>
    	<div class="just-a-box" />
	</div>
</div>`;

import Vue from "../../public/js/vue.js";

export default Vue.defineComponent( {
	name: "AlmanacHeader",
	template,
	setup() {
		const nums = [
			"", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十",
			"十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十",
			"二十一", "二十二", "二十三", "二十四", "二十五", "二十六", "二十七", "二十八", "二十九", "三十",
			"三十一"
		];
		
		const d = new Date();
		const year = d.getFullYear();
		const month = nums[d.getMonth() + 1] + ( d.getMonth() < 10 ? "月" : "" );
		const day = nums[d.getDate()];
		
		return { year, month, day };
	}
} );