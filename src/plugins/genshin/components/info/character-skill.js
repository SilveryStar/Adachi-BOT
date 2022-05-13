const template = `<div class="character-skill">
	<info-card class="skill-card">
	    <h3 class="skill-card-title">{{ skill.title }}</h3>
		<div class="skill-card-content" v-html="skill.description"></div>
	</info-card>
	<info-card class="burst-card">
	    <h3 class="skill-card-title">{{ burst.title }}</h3>
		<div class="skill-card-content" v-html="burst.description"></div>
	</info-card>
</div>`;

import InfoLine from "./info-line.js";
import InfoCard from "./info-card.js";
import MaterialsList from "./materials-list.js"

const { defineComponent, computed, toRefs } = Vue;

export default defineComponent( {
	name: "CharacterSkill",
	template,
	components: {
		InfoLine,
		InfoCard,
		MaterialsList,
	},
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
	setup( props ) {
		const data = props.data;
		const starIcon = computed( () => {
			return `https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/info/icon/BaseStar${ data.rarity }.png`;
		} );
		const numCN = [ "壹", "贰", "肆", "陆" ];
		
		const materialsTitle = `材料消耗${ data.time }`;
		
		const baseInfo = [
			{
				生日: data.birthday,
				神之眼: data.element
			},
			{
				声优: data.cv
			},
			{
				命之座: data.constellationName
			}
		];
		
		const dataBlockInfo = [
			{
				生命: data.baseHP,
				防御: data.baseDEF
			},
			{
				攻击: data.baseATK,
				[data.mainStat]: data.mainValue
			}
		];
		
		const materialsInfo = [
			{
				label: "升级",
				value: data.levelUpMaterials,
				showTitle: false,
			},
			{
				label: "天赋",
				value: data.talentMaterials,
				showTitle: true,
			},
			{
				label: "突破",
				value: data.ascensionMaterials,
				showTitle: false,
			},
		];
		
		return {
			...toRefs( data ),
			materialsTitle,
			starIcon,
			baseInfo,
			dataBlockInfo,
			materialsInfo,
			numCN
		}
	}
} );
