const template =
`<div class="character">
	<div class="base-info">
		<div class="birthday">
		    <p class="title">生日: </p>
		    <p class="content">{{ birthday }}</p>
	    </div>
	    <div class="element">
		    <p class="title">神之眼: </p>
		    <p class="content">{{ element }}</p>
	    </div>
	    <div class="cv">
		    <p class="title">声优:</p>
		    <p class="content">{{ cv }}</p>
	    </div>
	    <div class="constellation-name">
		    <p class="title">命之座: </p>
		    <p class="content">{{ constellationName }}</p>
	    </div>
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
            title="升级材料:"
            :arr="levelUp"
        ></ItemList>
        <ItemList
            title="天赋材料:"
            :arr="talent"
        ></ItemList>
        <ItemList
            title="突破材料:"
            :arr="ascension"
        ></ItemList>
    </div>
    <div class="constellation">
        <div class="box" v-for="i in 4">
            <p class="level">{{ numCN[i-1] }}</p>
            <p class="content">{{ constellations[i-1] }}</p>
        </div>
    </div>
</div>`;

import Vue from "../../public/js/vue.js";
import ItemList from "./item-list.js";

export default Vue.defineComponent( {
	name: "InfoCharacter",
	template,
	props: {
		birthday: String,
		element: String,
		cv: String,
		constellationName: String,
		rarity: Number,
		mainStat: String,
		mainValue: String,
		baseATK: Number,
		ascension: Array,
		levelUp: Array,
		talent: Array,
		constellations: Array,
		time: String
	},
	components: {
		ItemList
	},
	setup( props ) {
		const starIcon = Vue.computed( () => {
			return `https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/info/other/BaseStar${ props.rarity }.png`;
		} );
		const numCN = [ "壹", "贰", "肆", "陆" ];
		
		return {
			starIcon,
			numCN
		}
	}
} );