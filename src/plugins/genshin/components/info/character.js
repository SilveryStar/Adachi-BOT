const template = `<div class="info-character">
	<ul class="base-info">
		<li v-for="key of Object.keys(baseInfo)" :key="index">
		    <span class="title">{{ key }}:</span>
		    <span class="content">{{ baseInfo[key] }}</span>
	    </li>
	</ul>
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
			v-for="key of Object.keys(materialsInfo)"
			:key="key"
            :title="key"
			label-width="65px"
            :arr="materialsInfo[key]"
        ></ItemList>
    </div>
    <div class="constellation">
        <div class="box" v-for="i in 4">
            <p class="level">{{ numCN[i-1] }}</p>
            <p class="content">{{ constellations[i-1] }}</p>
        </div>
    </div>
</div>`;

import ItemList from "./item-list.js";

const { defineComponent, computed, toRefs } = Vue;

export default defineComponent( {
	name: "InfoCharacter",
	template,
	props: {
		data: {
			type: Object,
			default: () => ( {
				birthday: "",
				element: "",
				cv: "",
				constellationName: "",
				rarity: null,
				mainStat: "",
				mainValue: "",
				baseHP: null,
				baseATK: null,
				baseDEF: null,
				ascensionMaterials: [],
				levelUpMaterials: [],
				talentMaterials: [],
				constellations: [],
				time: ""
			} )
		}
	},
	components: {
		ItemList,
	},
	setup( props ) {
		const data = props.data;
		const starIcon = computed( () => {
			return `https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/info/icon/BaseStar${ data.rarity }.png`;
		} );
		const numCN = [ "壹", "贰", "肆", "陆" ];
		
		const baseInfo = {
			生日: data.birthday,
			神之眼: data.element,
			声优: data.cv,
			命之座: data.constellationName
		};
		
		const dataBlockInfo = {
			基础生命值: data.baseHP,
			基础攻击力: data.baseATK,
			基础防御力: data.baseDEF,
			[data.mainStat]: data.mainValue
		};
		
		const materialsInfo = {
			升级材料: data.levelUpMaterials,
			天赋材料: data.talentMaterials,
			突破材料: data.ascensionMaterials
		};
		
		return {
			...toRefs( data ),
			starIcon,
			baseInfo,
			dataBlockInfo,
			materialsInfo,
			numCN
		}
	}
} );
