const template =
`<div class="weapon">
	<div class="access">
	    <p class="title">获取方式: </p>
	    <p class="content">{{ access }}</p>
    </div>
    <div class="data-block">
	    <img class="star-icon" :src="starIcon" alt="ERROR"/>
	    <p class="value atk">{{ baseATK }}</p>
	    <p class="title atk">基础攻击力</p>
	    <p class="value main">{{ mainValue }}</p>
	    <p class="title main">{{ mainStat }}</p>
    </div>
    <p class="time">{{ time }}</p>
    <div class="materials">
        <ItemList
            title="突破材料:"
            :arr="ascension[0]"
        ></ItemList>
        <ItemList
            title=""
            :arr="ascension[1]"
        ></ItemList>
    </div>
    <div class="skill">
        <p class="name">{{ skillName }}</p>
        <div class="content" v-html="skillContent"></div>
    </div>
</div>`;

import Vue from "../../public/js/vue.js";
import ItemList from "./item-list.js";

export default Vue.defineComponent( {
	name: "InfoWeapon",
	template,
	components: {
		ItemList
	},
	props: {
		access: String,
		rarity: Number,
		mainStat: String,
		mainValue: String,
		baseATK: Number,
		ascension: Array,
		time: String,
		skillName: String,
		skillContent: String
	},
	setup( props ) {
		const starIcon = Vue.computed( () => {
			return `https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/info/other/BaseStar${ props.rarity }.png`;
		} );
		
		return {
			starIcon
		}
	}
} );