const template = `<div class="weapon">
	<div class="info-top-base">
		<info-line title="基本属性" :data="dataBlockInfo"></info-line>
		<info-card class="skill-card">
			<h3 class="skill-title">{{ skillName }}</h3>
        	<div class="skill-content" v-html="skillContent"></div>
		</info-card>
	</div>
	<info-card class="materials-card" :title="materialsTitle">
		<materials-list :data="materialsInfo" ></materials-list>
	</info-card>
</div>`;

import InfoLine from "./info-line.js";
import InfoCard from "./info-card.js";
import MaterialsList from "./materials-list.js"

const { defineComponent, computed, toRefs } = Vue;

export default defineComponent( {
	name: "InfoWeapon",
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
		
		const materialsTitle = `材料消耗${ data.time }`;
		
		const materialsInfo =
			{
				label: "突破",
				value: data.ascensionMaterials?.flat(),
				showTitle: false,
			}
		
		const dataBlockInfo = [
			{
				基础攻击力: data.baseATK,
				[data.mainStat]: data.mainValue
			},
			{
				来源: data.access
			}
		];
		
		return {
			...toRefs( data ),
			materialsTitle,
			materialsInfo,
			dataBlockInfo
		}
	}
} );
