const template = `<div class="character-normal">
	<div class="info-top">
		<div class="info-top-base">
			<info-line title="基本信息" :data="baseInfo"></info-line>
			<info-line title="基本属性" :data="dataBlockInfo"></info-line>
		</div>
		<info-card class="materials-card" :title="materialsTitle">
			<materials-list v-for="(d, dKey) of materialsInfo" :key="lKey" :data="d" ></materials-list>
		</info-card>
	</div>
	<div class="info-bottom">
		<info-card class="talents-card" title="天赋信息" direction="row">
			<p class="talents-item" v-for="(t, tKey) of talents" :key="tKey">{{ t }}</p>
		</info-card>
		<info-card class="constellations-card" title="命座信息" direction="row">
        	<div class="constellations-item" v-for="i in 4" :key="i">
        	    <p class="level">{{ numCN[i-1] }}</p>
        	    <p class="content">{{ constellations[i-1] }}</p>
        	</div>
		</info-card>
	</div>
</div>`;

import InfoLine from "./info-line.js";
import InfoCard from "./info-card.js";
import MaterialsList from "./materials-list.js"

const { defineComponent, computed, toRefs } = Vue;

export default defineComponent( {
	name: "CharacterNormal",
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
