const template = `<div class="info-weapon">
	<div class="access">
	    <p class="title">获取方式: </p>
	    <p class="content">{{ access }}</p>
    </div>
    <div class="data-block">
	    <img class="star-icon" :src="starIcon" alt="ERROR"/>
		<ul class="data-block-info">
			<li v-for="key of Object.keys(dataBlockInfo)" :key="key">
			    <span class="title" :class="{'special-title': key.length > 5}">{{ key }}:</span>
			    <span class="value">{{ dataBlockInfo[key] }}</span>
	    	</li>
		</ul>
    </div>
    <div class="materials">
		<p class="time">{{ time }}</p>
        <ItemList
            title="突破材料"
			label-width="65px"
            :arr="ascensionMaterials[0]"
        ></ItemList>
        <ItemList
            title=""
			label-width="65px"
            :arr="ascensionMaterials[1]"
        ></ItemList>
    </div>
    <div class="skill">
        <p class="name">{{ skillName }}</p>
        <div class="content" v-html="skillContent"></div>
    </div>
</div>`;

import ItemList from "./item-list.js";

const { defineComponent, computed, toRefs } = Vue;

export default defineComponent( {
	name: "InfoWeapon",
	template,
	components: {
		ItemList
	},
	props: {
		data: {
			type: Object,
			default: () => ( {
				access: "",
				rarity: null,
				mainStat: "",
				mainValue: "",
				baseATK: null,
				ascensionMaterials: [],
				time: "",
				skillName: "",
				skillContent: ""
			} )
		}
	},
	setup( props ) {
		const data = props.data;
		const starIcon = computed( () => {
			return `https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/info/icon/BaseStar${ data.rarity }.png`;
		} );
		
		const dataBlockInfo = {
			基础攻击力: data.baseATK,
			[data.mainStat]: data.mainValue
		};
		
		return {
			...toRefs( data ),
			starIcon,
			dataBlockInfo
		}
	}
} );
